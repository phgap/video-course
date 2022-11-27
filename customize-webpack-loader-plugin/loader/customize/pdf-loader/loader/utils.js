const { stat, mkdirSync } = require('fs');

function createPathIfNotExist(absPath) {
    stat(absPath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 路径不存在
                console.log('路径不存在。path：', absPath);
                mkdirSync(absPath);
            } else {
                console.log('Error while checking path', err);
            }
            return;
        }
        if (!stats.isDirectory()) {
            // console.log(`${absPath} is directory ?`, stats.isDirectory());
            console.log('目标路径不是文件夹', absPath);
        }
    })
}

module.exports = {
    createPathIfNotExist
}