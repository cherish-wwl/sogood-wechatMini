
Page({
    //页面的初始数据
    data: {
        options: {},
        files: [],
        images: [],
        count: 9, // 最多可以选择的图片张数
        auth: null,
        show:false
    },
    onLoad: async function (option) {
        this.setData({
            options: option
        });
        this.chooseLocalImage()
        await this.getAuth()
        console.log('onLoad',this.data)
    },
    onShow: async function(){
        if (!this.data.auth) {
            await this.getAuth()
        }
        console.log('onShow',this.data)
    },
    getAuth() {
        var that = this;
        const url = 'https://www.sogoodprint.com/stage-api/document/policy';
        return new Promise( (reslove,reject) => {
            wx.request({
                url: url,
                header: {
                    'content-type': 'application/json', // 默认值
                    'token': this.options.token,
                    'type': '1'
                },
                success(res) {
                    console.log(res.data)
                    if (res.data.code == 200) {
                        that.setData({
                            auth: res.data.data
                        })
                    }
                    reslove(res)
                },
                fail:function(res){
                    that.setData({
                        show: JSON.stringify(res) + url
                    })
                    reject(res)
                }
            })
        })
     
    },

    chooseLocalImage: function () {
        var that = this;
        var count = that.data.count;
        wx.chooseMessageFile({
            count: count,
            type: 'file',
            // extension: ['pdf','doc','docx','xls','xlsx','ppt','pptx','rar',''],
            success: function (res) {
                var length = res.tempFiles.length;
                count -= length;

                that.data.images = that.data.images.concat(res.tempFiles)

                that.data.images.forEach((item, i) => {
                    if (!item.ossUrl && item.upload != '失败') {
                        that.startupload(item, i)
                    }
                })
                that.setData({
                    count: count,
                    images: that.data.images
                });
                console.log(that.data.images)
            }
        })

    },
    async startupload(file, i) {
        if (!this.data.auth) return
        const { policy, dir, signature, accessid, host } = this.data.auth
        var that = this;
        const uploadTask = wx.uploadFile({
            url: 'https://sogood.oss-cn-beijing.aliyuncs.com',
            filePath: file.path,
            name: 'file',
            formData: {
                key: dir + file.time + '_' + file.name,
                policy: policy,
                OSSAccessKeyId: accessid,
                success_action_status: "200",
                signature: signature,
            },
            success: function (res) {
                console.log('success', res)
                if (res.statusCode != 200) {
                    wx.showToast({
                        title: '哎呀，出错了(' + res.statusCode + ')',
                        icon: 'loading'
                    })
                    return
                }
                that.setData({
                    ['images[' + i + '].ossUrl']: host + '/' + dir + file.time + '_' + file.name,
                })
            },
            fail: function (res) {
                console.log(res)
                that.setData({
                    ['images[' + i + '].upload']: '失败',
                })
            }
        })


        uploadTask.onProgressUpdate((res) => {
            console.log('onProgressUpdate', res)
            that.setData({
                ['images[' + i + '].percent']: res.progress,
            })
        })
        that.setData({
            ['images[' + i + '].uploadTask']: uploadTask,
        })
    },
    btnClick(e) {
        const { index } = e.currentTarget.dataset
        const item = this.data.images[index]
        if (!item.ossUrl) {
            item.uploadTask && item.uploadTask.abort && item.uploadTask.abort()
            const newImages = this.data.images
            newImages.splice(index, 1)
            this.setData({
                images: newImages
            })
        }
    },
    removeImage: function (event) {
        this.setData({
            count: ++this.data.count
        });
        var url = event.currentTarget.id;
        this.data.images.forEach((image, idx) => {
            if (image.url === url) {
                this.data.images.splice(idx, 1);
                this.data.uploader.deleteFile(idx);
                this.setData({
                    images: this.data.images
                });
            }
        })
    },
    saveToServer: function (item) {
        wx.request({
            method: 'POST',
            url: 'https://www.sogoodprint.com/stage-api/document/uploadFile',
            header: {
                'content-type': 'application/json', // 默认值
                'token': this.options.token,
                'type': '1'
            },
            data: {
                fileName: item.name,
                fileType: item.type,
                fileUrl: item.ossUrl
            },
            success(res) {

            }
        })
    },
    confrim() {
        this.data.images.forEach(async item => {
            await this.saveToServer(item)
        })
        // wx.setStorageSync('files', this.data.images)

        wx.reLaunch({
            url: '/pages/index/index',
        })
        // wx.navigateTo({
        //     url: '/pages/index/index',
        //     fail: function () {
               
        //     }
        // })

    }

})
