const path = require('path');
const dotenv = require('dotenv');
const package = require('./package.json');

dotenv.config();

// Type checking을 더 빨리 해주는 플러그인
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// 리소스를 지정된 디렉토리에 복사해주는 플러그인
const CopyPlugin = require('copy-webpack-plugin');

/**
 * commonly used config for both main, renderer process
 */
const common = {
	module: {
		rules: [
			{
				test: /\.(m?js|node)$/,
				parser: { amd: false },
				use: {
					loader: '@marshallofsound/webpack-asset-relocator-loader',
					options: {
						outputAssetBase: 'native_modules',
					},
				},
			},
			{
				test: /\.tsx?$/,
				exclude: /(node_modules|\.webpack)/,
				use: {
					loader: 'ts-loader',
					options: {
						transpileOnly: true,
					},
				},
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			// following is rule that load static assets for renderer (in /public)
			{
				test: /\.(svg|png|jpe?g|ico|icns)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[path][name].[ext]',
						publicPath: '..', // move up from 'window' folder
						context: 'src', // set relative working folder to src
					},
				},
			},
		],
	},
	devtool: 'inline-source-map',
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
	},
};

const main = {
	...common,
	entry: './src/main',
	plugins: [new ForkTsCheckerWebpackPlugin(), new CopyPlugin({ patterns: [{ from: './src/static/icon', to: 'icon' }] })],
};

const renderer = {
	...common,
	entry: './src/renderer',
	plugins: [new ForkTsCheckerWebpackPlugin()],
};

module.exports = {
	plugins: [
		[
			'@electron-forge/plugin-webpack',
			{
				mainConfig: main,
				renderer: {
					config: renderer,
					nodeIntegration: true,
					entryPoints: [
						{
							name: 'main',
							html: './src/static/index.html',
							js: './src/renderer/index.tsx',
						},
						{
							name: 'splash',
							html: './src/static/splash.html',
						},
						{
							name: 'lecture',
							html: './src/static/lecture.html',
						},
					],
				},
			},
		],
	],
	electronRebuildConfig: {
		// keytar needs napi module!
		//extraModules: ['ffi-napi'],
	},
	packagerConfig: {
		asar: false,
		darwinDarkModeSupport: 'true',
		packageManager: 'yarn',
		executableName: 'door-desktop',
		icon: 'src/static/icon',
	},
	makers: [
		// {
		// 	name: '@electron-forge/maker-zip',
		// },
		{
			name: '@electron-forge/maker-squirrel',
			config: arch => ({
				name: 'door-desktop',
				iconUrl: 'https://raw.githubusercontent.com/deu-door/door-desktop-resources/main/icon.ico',
				setupIcon: './src/static/icon/icon.ico',
				setupExe: `door-desktop-${package.version}-setup-win-${arch}.exe`,
				certificateFile: './cert/cert.pfx',
				certificatePassword: process.env.CSC_KEY_PASSWORD,
			}),
		},
		{
			name: '@electron-forge/maker-deb',
			config: {
				options: {
					icon: './src/static/icon/icon.png',
				},
			},
		},
		{
			name: '@electron-forge/maker-dmg',
		},
		// {
		// 	name: '@electron-forge/maker-appx',
		// },
		// {
		// 	name: '@electron-forge/maker-rpm',
		// },
	],
};
