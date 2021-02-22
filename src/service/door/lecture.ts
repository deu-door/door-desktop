import cheerio from 'cheerio';
import {
	FetchableMap,
	fulfilledFetchable,
	ID,
	Link,
	notFulfilledFetchable,
} from './interfaces';
import { Lecture, LecturesByWeek } from './interfaces/lecture';
import { YouTubeURLParser } from '@iktakahiro/youtube-url-parser';
import moment from 'moment';
import { doorAxios, parseTableElement } from './util';

// Example data
// viewDoor(cn, dn, dt, dst, dd, df, dw, dh, fid, inningno, astatus)

// 기초프로그래밍II 유투브 강의 2개
// viewDoor(36463,71897, 0, 0, 'https://youtu.be/-m_x6xyowvQ', 0, 560, 315, 'frmpop');
// viewDoor(36463,71994, 0, 0, 'https://youtu.be/Z6TjsQ_j9ZY', 0, 560, 315, 'frmpop');

// ICT융합기술론 PPT 자료
// viewDoor(36299,66770, 1, 5, '', 1632456, 560, 315, 'frmpop');
// viewDoor(36299,71312, 1, 5, '', 1674655, 560, 315, 'frmpop');

// 비주얼프로그래밍 자체 동영상 플레이어 (재생기록 X)
// viewDoor(36713,73268, 0, 3, '', 1690422, 1280, 720, 'frmpop');
// viewDoor(36713,70701, 0, 3, '', 1668171, 1280, 720, 'frmpop');
// viewDoor(36713,70702, 0, 3, '', 1668179, 1280, 720, 'frmpop');

// 부산과세계 온라인강의 자체 동영상 플레이어 (재생기록 O)
// javascript:viewDoor(34300,557, 0, 2, '', 0, 560, 315, 'frmpop', 436049, 'CLAT001');
// javascript:viewDoor(34300,563, 0, 2, '', 0, 560, 315, 'frmpop', 436055, 'CLAT001');

const parseViewDoorFunction = (func: string) => {
	const params = (
		func.match(/viewDoor\((?<params>.*)\)/)?.groups?.params || ''
	)
		.split(',')
		.map(d => d.replaceAll("'", '').trim());

	const DoorType = {
		BUILTIN: '0',
		EXTERNAL: '1',
	};

	const Destination = {
		UNKNOWN_0: '0',
		UNKNOWN_2: '2',
		UNKNOWN_3: '3',
		FILE: '5',
	};

	const namedParams = {
		courseId: params[0],
		doorId: params[1],
		doorType: params[2] as keyof typeof DoorType,
		destination: params[3] as keyof typeof Destination,
		externalLink: decodeURIComponent(params[4]),
		fileId: params[5],
		doorWidth: params[6],
		doorHeight: params[7],
		fid: params[8] || 'frmpop',
		inningno: params[9] || 0,
		astatus: params[10],
	};

	let link =
		namedParams.doorType === DoorType.BUILTIN
			? // Using built-in video player. (whether the type is online or offline)
			  namedParams.destination === Destination.UNKNOWN_0
				? namedParams.externalLink
				: `/Door/DoorView?DoorNo=${namedParams.doorId}&CoursesNo=${namedParams.courseId}&InningNo=${namedParams.inningno}`
			: // Using external link or file.
			namedParams.destination === Destination.FILE
			? `/common/filedownload/${namedParams.fileId}`
			: namedParams.destination === Destination.UNKNOWN_0
			? namedParams.externalLink
			: '';

	// Default link is door.deu.ac.kr
	if (link.startsWith('/')) link = 'http://door.deu.ac.kr' + link;

	const parser = new YouTubeURLParser(link);

	if (parser.isValid()) link = parser.getEmbeddingURL() || link;

	const result: {
		doorId: string;
		link: string;
		historyLink: Link;
	} = {
		doorId: namedParams.doorId,
		link: link,
		historyLink: {
			url: '/Door/DoorViewHistory',
			method: 'POST',
			data: {
				DoorNo: namedParams.doorId,
				CourseNo: namedParams.courseId,
			},
		},
	};

	return result;
};

export async function getLecturesByWeek(
	courseId: ID,
	week: string | number,
): Promise<FetchableMap<Lecture>> {
	const document = cheerio.load(
		(
			await doorAxios.get(
				`/LMS/LectureRoom/DoorWeekDoors/${courseId}?w=${week}`,
			)
		).data,
	);

	const lectures: Lecture[] = document(`#subDoorListCon div.listItem`)
		.toArray()
		.map(lecture => {
			const viewDoor = parseViewDoorFunction(
				document(`a[title=바로보기]`, lecture).attr('onclick') || '',
			);

			return {
				id: viewDoor.doorId,
				courseId: courseId,
				week: Number(week),

				title: document(`.lt_title > span`, lecture).text(),
				contents: document(`.lt_desc`, lecture).text(),
				createdAt: new Date(
					document(`.lt_info`, lecture)
						.text()
						.match(/\d+\.\d+\.\d+/)?.[0] || '',
				),
				views: Number(
					document(`.lt_info`, lecture)
						.text()
						.match(/조회\((\d+)\)/)?.[1],
				),

				link: viewDoor.link,
				historyLink: viewDoor.historyLink,

				tags: document(`.lt_tag`, lecture)
					.text()
					.split(/ ?, ?/)
					.map(d => d.trim()),

				achieved: false,

				...fulfilledFetchable(),
			};
		});

	return {
		items: Object.fromEntries(
			lectures.map(lecture => [lecture.id, lecture]),
		),

		...fulfilledFetchable(),
	};
}

export async function getLectures(
	courseId: ID,
): Promise<FetchableMap<LecturesByWeek>> {
	const lecturesDocument = cheerio.load(
		(await doorAxios.get(`/LMS/LectureRoom/DoorWeeks/${courseId}`)).data,
	);

	const detailDocument = cheerio.load(
		(await doorAxios.get(`/LMS/LectureRoom/CourseLetureDetail/${courseId}`))
			.data,
	);

	const lecturesTable = lecturesDocument(`#mainForm > div > table`)
		.toArray()
		.shift();

	const detailTable = detailDocument(
		`#wrap > div.subpageCon > div:nth-child(5) > div.form_table > table`,
	)
		.toArray()
		.shift();

	if (!lecturesTable || !detailTable)
		throw new Error(
			'온라인 강의 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.',
		);

	const lecturesByWeek = parseTableElement(lecturesTable);

	const detail = Object.fromEntries(
		parseTableElement(detailTable).map(row => [row['주차'].text, row]),
	);

	const weeks: LecturesByWeek[] = lecturesByWeek.map(row => {
		const week = row['주차'].text;

		const from = moment(detail[week]['출석기간'].text.split('~')[0].trim())
			.startOf('days')
			.toDate();
		const to = moment(detail[week]['출석기간'].text.split('~')[1].trim())
			.endOf('days')
			.toDate();

		return {
			id: week,
			courseId: courseId,

			description: row['주제'].text,
			remark: detail[week]['과제/비고'].text,

			views: Number(row['조회'].text),
			count: Number(row['DOOR'].text),

			period: { from, to },

			items: {},

			...notFulfilledFetchable(),
		};
	});

	return {
		items: Object.fromEntries(weeks.map(week => [week.id, week])),

		...fulfilledFetchable(),
	};
}
