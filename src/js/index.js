import {RenderCanvas} from './index/selectseat'

window.onload = function () {
    var canvas = document.getElementById('canvas')
    var tempX, tempY
    var canvasRender = new RenderCanvas({
        target: canvas,
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
        zoomMax: 2,
        unabledArr: [[0,0],[5,8]]
    })
    canvasRender.init()
    canvas.addEventListener('touchstart',(e) => {
        let left = canvas.getBoundingClientRect().left
        let top = canvas.getBoundingClientRect().top
        let pos = canvasRender.touchPos
        let touches = e.touches
        if (touches.length === 1) {
            canvasRender.starttime = +new Date()
            pos.clickX = e.touches[0].clientX - left
            pos.clickY = e.touches[0].clientY - top
        } else if (touches.length === 2) {
            canvasRender.isZoom = true
            pos.touches[0].startX = touches[0].clientX - left
            pos.touches[1].startX = touches[1].clientX - left
            pos.touches[0].startY = touches[0].clientX - top
            pos.touches[1].startY = touches[1].clientY - top
        }
    }, false)
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault()
        let pos = canvasRender.touchPos
        let touches = e.touches
        if (touches.length === 2) {
            let sx0 = touches[0].clientX - pos.touches[0].startX
            let sx1 = touches[1].clientX - pos.touches[1].startX
            let sy0 = touches[0].clientY - pos.touches[0].startY
            let sy1 = touches[1].clientY - pos.touches[1].startY
            let tx = pos.touches[0].startX - pos.touches[1].startX
            let ty = pos.touches[0].startY - pos.touches[1].startY
            let scale = Math.pow((Math.pow(sx1 - sx0,2) + Math.pow(sy1 - sy0,2)), 1/2)/canvas.width
            if (tx >= 0 && ty >= 0) {
                if(sx0 >= 0 && sx1 <= 0 || sy0 >= 0 && sy1 <= 0) {
                    canvasRender.s = 1 + scale
                    canvasRender.zoomType = 'max'
                } else if (sx0 <= 0 && sx1 >= 0 || sy0 <= 0 && sy1 >= 0) {
                    canvasRender.s = 1 - scale
                    canvasRender.zoomType = 'min'
                }
            } else if (tx > 0 && ty < 0) {
                if(sx0 >= 0 && sx1 <= 0 || sy0 <= 0 && sy1 >= 0) {
                    canvasRender.s = 1 + scale
                    canvasRender.zoomType = 'max'
                } else if (sx0 >= 0 && sx1 <= 0 || sy0 >= 0 && sy1 <= 0) {
                    canvasRender.s = 1 - scale
                    canvasRender.zoomType = 'min'
                }
            } else if (tx < 0 && ty < 0) {
                if(sx0 <= 0 && sx1 >= 0 || sy0 <= 0 && sy1 >= 0) {
                    canvasRender.s = 1 + scale
                    canvasRender.zoomType = 'max'
                } else if (sx0 >= 0 && sx1 <= 0 || sy0 >= 0 && sy1 <= 0) {
                    canvasRender.s = 1 - scale
                    canvasRender.zoomType = 'min'
                }
            } else if (tx < 0 && ty > 0) {
                if(sx0 <= 0 && sx1 >= 0 || sy0 >= 0 && sy1 <= 0) {
                    canvasRender.s = 1 + scale
                    canvasRender.zoomType = 'max'
                } else if (sx0 <= 0 && sx1 >= 0 || sy0 <= 0 && sy1 >= 0) {
                    canvasRender.s = 1 - scale
                    canvasRender.zoomType = 'min'
                }
            }
            canvasRender.s = canvasRender.s < canvasRender.zoomMin ? canvasRender.zoomMin : canvasRender.s
            canvasRender.s = canvasRender.s > canvasRender.zoomMax ? canvasRender.zoomMax : canvasRender.s
            canvasRender.update()
        } else if (touches.length === 1){
            if (canvasRender.s > 1 && !canvasRender.isClick){
                tempX = e.touches[0].clientX - pos.clickX 
                tempY = e.touches[0].clientY - pos.clickY
                pos.mx = e.touches[0].clientX - pos.clickX + pos.mxt
                pos.my = e.touches[0].clientY - pos.clickY + pos.myt
                canvasRender.update()
            } else {
                pos.mx = pos.my = 0
            } 
        }
    }, false)
    canvas.addEventListener('touchend', function () {
        let {
            touchPos
        } = canvasRender
        if (canvasRender.isZoom) {
            canvasRender.s = canvasRender.zoomType === 'max' ? canvasRender.zoomMax : canvasRender.zoomMin
            if (canvasRender.zoomType === 'min') {
                touchPos.mx = touchPos.my = touchPos.myt = touchPos.mxt = 0
            }
            canvasRender.update()
            canvasRender.isZoom = false
            // alert(JSON.stringify(canvasRender))
        } else {
            if (+new Date() - canvasRender.starttime < 150) {
                canvasRender.isClick = true
                canvasRender.update()
            } else {
                touchPos.mx = touchPos.mxt = tempX
                touchPos.my = touchPos.myt = tempY
            }
        }
    }, false)
}