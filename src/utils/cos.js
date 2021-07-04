import Vue from 'vue'

export function cosUploadFile(
  uploadName, uploadFile, onProgress, onFileFinish) {
  Vue.$cos.uploadFiles({
    files: [{
      Bucket: 'iwallet-1303074949',
      Region: 'ap-chengdu',
      Key: uploadName,
      Body: uploadFile
    }],
    onProgress,
    onFileFinish
  })
}

export function cosUploadFiles(uploadFiles, onProgress, onFileFinish) {
  const files = uploadFiles.map(file => ({
    Bucket: 'iwallet-1303074949',
    Region: 'ap-chengdu',
    Key: file.uploadName,
    Body: file.uploadFile
  }))
  Vue.$cos.uploadFiles({
    files,
    onProgress,
    onFileFinish
  })
}
