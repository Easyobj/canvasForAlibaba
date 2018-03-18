// 构造函数
function RenderCanvas (args) {
    let defaultProps = {
        starttime: +new Date(), // 触摸开始时间
        target: null, // canvas 目标dom
        w:400, // canvas宽度
        h:400, // canvas高度
        s:1, // 当前放大倍数
        isClick: false, // 是否为点击事件
        isZoom:false, // 是否属于zoom操作
        zoomType: 'max',
        zoomMax:1, // 放大的最大倍数
        zoomMin:1, // 放大的最小倍数
        selectedArr:[], // 已经选择的座位
        unabledArr:[], // 不可选择的位置
        defaultColor:'#ddd', // 默认未选择的颜色
        selectedColor:'green', // 选中时的颜色
        unabledColor:'red', // 不可选时的颜色
        strokeColor:'#000', // 边框的颜色
        limitNum:4, //最多可以选择的座位数
        rowLen:10, // 座位列数
        colLen:10, // 座位行数
        touchPos: {
            clickX: 0,
            clickY: 0,
            mxt:0,
            myt:0,
            mx:0, // 单指移动的x距离
            my:0, //单指移动的y距离
            touches: [ //双指zoom操作
                {
                    startX:0,
                    startY:0
                },
                {
                    startX:0,
                    startY:0
                }
            ]
        }
    } 
    let obj = Object.assign({},defaultProps,args)
    obj.target.width = obj.w
    obj.target.height = obj.h
    // context
    obj.ctx = obj.target.getContext('2d')
    // 存储所有绘制的图形数据
    obj.drawData = []
    for (const key in obj) {
        this[key] = obj[key]
    }
    return this
}  

// 初始化
RenderCanvas.prototype.init = function (args) {
    this.update()
}

// 更新canvas
RenderCanvas.prototype.update = function (args) {
    let {
        ctx,
        drawData,
        w,
        h,
        rowLen,
        colLen,
        s,
        touchPos
    } = this
    ctx.clearRect(0,0,w,h)
    this.drawData = []
    for (let i = 0; i < rowLen; i++) {
        for (let j = 0; j < colLen; j++) {
            this.drawData.push({
                id: i + '' + j,
                type: 'rect',
                x: s*w/rowLen * (j + 0.1) + touchPos.mx,
                y: s*w/rowLen * i + s*(h - w)/2 + touchPos.my,
                width: 0.8 * s*w/rowLen,
                height: 0.8 * s*w/rowLen
            })
           
            this.draw({
                x: s*w/rowLen*(j+0.1) + touchPos.mx,
                y: s*w/rowLen*i + s*(h - w)/2 + touchPos.my,
                w: 0.8*s*w/rowLen,
                h: 0.8*s*w/rowLen,
                i,
                j
            })
        }
    }
}

// rect绘制
RenderCanvas.prototype.draw = function (args) {
    let {
        x, // x坐标位置
        y, // y坐标位置
        w, // rect宽度
        h, // rect高度
        i,
        j
    } = args
    let {
        strokeColor,
        selectedArr,
        unabledArr,
        defaultColor,
        selectedColor,
        unabledColor,
        touchPos,
        isClick,
        limitNum
    } = this
    let {
        clickX,
        clickY
    } = touchPos
    let ctx = this.ctx
    let color = defaultColor
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.fillStyle = color
    ctx.strokeStyle = strokeColor
    ctx.fill();
    ctx.stroke()
    ctx.closePath()
    ctx.restore()

    // 判断是否在不可选的数组里面
    for (let u = 0; u < unabledArr.length; u++) {
        if (unabledArr[u][0] === j && unabledArr[u][1] === i) {
            color = unabledColor
            ctx.fillStyle = unabledColor
            ctx.fill()
            break
        } 
    }
    // 判断是否在已经选择的数组里面
    if (color !== unabledColor) {
        for (let u = 0; u < selectedArr.length; u++) {
            if (selectedArr[u][0] === j && selectedArr[u][1] === i) {
                color = selectedColor
                ctx.fillStyle = color
                ctx.fill()
                break
            } 
        }
    }
    // 处理click事件
    if (color !== unabledColor && isClick && ctx.isPointInPath(clickX,clickY)) {
        for (let u = 0; u < selectedArr.length; u++) {
            if (selectedArr[u][0] === j && selectedArr[u][1] === i) {
                color = defaultColor
                ctx.fillStyle = color
                ctx.fill()
                selectedArr.splice(u,1)
                this.isClick = false
                break
            } 
        }
        if (selectedArr.length < limitNum && this.isClick){
            color = selectedColor
            ctx.fillStyle = color
            ctx.fill()
            this.selectedArr.push([j,i])
            this.isClick = false
        } else if (selectedArr.length >= limitNum && this.isClick) {
            this.isClick = false
            alert('最多只能选'+ limitNum +'张票')
        }
    }
}