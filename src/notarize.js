/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (
        electronPlatformName !== 'darwin'
    || !process.env.APPLEID
    || !process.env.APPLEIDPASS
    ) {
        console.log(
            'Not running notarize. Platform is not macOS or environment not set up.',
        );
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    notarize({
        appBundleId: 'com.myapp.greatapp',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS,
    });
};
