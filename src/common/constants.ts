import { name, productName, description, version, author, repository } from '../../package.json';

export const PACKAGE_NAME = name;
export const PACKAGE_PRODUCT_NAME = productName;
export const PACKAGE_DESCRIPTION = description;
export const PACKAGE_VERSION = version;
export const PACKAGE_AUTHOR = author;
export const PACKAGE_REPOSITORY_URL = repository.url;

export const IS_DEV = process.env.NODE_ENV !== 'production';
