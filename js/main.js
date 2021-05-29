$(() => {
    // 1.获取元素
    let oUl = document.querySelector("#list"),
        oStyle = document.getElementById("style"),
        aLi = oUl.children,
        $Btn = $("#btn-box");

    // 2.生成125个li
    (() => {
        // 创建虚拟节点 
        // 初始化一个styleText字符串来装之后通过循环获得的样式
        let f = document.createDocumentFragment(),
            styleText = "";

        // 添加125个li与其相应内容
        for (let i = 0; i < 125; i++) {
            let oLi = document.createElement("li");
            // 如果data.js中找不到相应下标的内容 就用118代替
            let thisData = data[i] || {
                order: `118`,
                name: "Uno",
                mass: ""
            };
            oLi.innerHTML = `
            <p>${thisData.name}</p>
            <p>${thisData.order}</p>
            <p>${thisData.mass}</p>
            `;
            // 计算四种变化所需要的样式 并用styleText存储
            styleText += `
                #wrap ul#list.Init li:nth-child(${i+1}){transform:${Init(i)}}
                #wrap ul#list.Grid li:nth-child(${i+1}){transform:${Grid(i)}}
                #wrap ul#list.Helix li:nth-child(${i+1}){transform:${Helix(i)}}
                #wrap ul#list.Table li:nth-child(${i+1}){transform:${Table(i)}}
                #wrap ul#list.Sphere li:nth-child(${i+1}){transform:${Sphere(i)}}
            `;
            // 在虚拟节点中添加获取完内容的li标签
            f.appendChild(oLi);
        };
        // 将循环完成后的styleText、获取了所有li的虚拟节点分别添加到预先设定好的style 和 oUl中
        oStyle.innerHTML = styleText;
        oUl.appendChild(f);
        // 强制渲染一次oUl 让他拥有初始的随机样式
        oUl.offsetLeft;
        // 将className初始化为Grid 并且由随机样式通过过渡效果变为初始的Grid布局
        oUl.className = "Grid";
    })();

    // 3.初始（随机）布局
    function Init() {
        // 将3d布局xyz分别给一个 -3000~3000的随机整数
        let tX = (Math.random() * 6000 - 3000) | 0,
            tY = (Math.random() * 6000 - 3000) | 0,
            tZ = (Math.random() * 6000 - 3000) | 0;
        return `translate3d(${tX}px,${tY}px,${tZ}px)`;
    };

    // 4.Grid布局
    function Grid(index) {
        /**
         * 已知当前li的序号
         *   --  index = y * 5 + x
         *   --  y = (index / 5 | 0) % 5
         *   --  x = index % 5
         *   --  z = index / 25 | 0
         */
        let x = index % 5,
            y = (index / 5 | 0) % 5, // 换了一层z轴 y要从0开始 所以需要模5
            z = index / 25 | 0;
        // 中心点是2,2,2  也就是不需要移动的li的坐标是2,2,2
        // 求出中心点的位置
        let tX = (x - 2) * 300,
            tY = (y - 2) * 300,
            tZ = (2 - z) * 1000; // 因为我们需要0，0，0正对用户，所以用2-z取得倒数
        return `translate3d(${tX}px,${tY}px,${tZ}px)`;
    };

    // 5.Helix布局
    function Helix(index) {
        /**
         * 1.每张图旋转10度
         * 2.每张图沿着旋转好的方向向外移800px
         * 3.每张图以125/2为中心（和ul的中心点一样的坐标） 向上或下平移8px
         */

        //  可以按照需求设定需要多少个环 例如需要4.5环
        let roY = 360 / (125 / 4.5);
        return `rotateY(${index*roY}deg) translateZ(800px) translateY(${8*(index-125/2)}px)`;
    };

    // 6.Table元素周期表布局
    function Table(index) {
        // 中心坐标（8.5 , 4）

        // 前18个没有按照规律排布的坐标 手动整理出来
        // 放入了data.js中

        // 根据元素周期表的特性 获得第index个元素的坐标
        let x, y;
        if (index < 18) {
            x = coor[index].x;
            y = coor[index].y;
        } else if (index < 90) {
            x = index % 18;
            y = (index / 18 | 0) + 2;
        } else if (index < 120) {
            x = (index - 90) % 15 + 1.5; // 让他错位1.5个宽度
            y = ((index - 90) / 15 | 0) + 7;
        } else {
            x = 17;
            y = 6;
        }
        let tX = (x - 8.5) * 160
        tY = (y - 4) * 200;
        return `translate(${tX}px,${tY}px)`;
    };

    // 7.Spherc布局
    function Sphere(index) {
        /**
         * 不运用数学模型布局球形 
         * 而是将一个圆看成由许多小圈排布围成的球
         */

        //  手动制定出一个排列方案 （也可以通过数学方法来进行计算）
        let arr = [1, 3, 7, 9, 11, 14, 21, 16, 12, 10, 9, 7, 4, 1];
        let sum = 0;
        let quan, ge;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
            if (sum >= (index + 1)) {
                // 说明当前的node处在第i圈 
                // sum>=因为是与个数做比较 所以需要+1（1-125）
                quan = i;
                ge = sum - index;
                break;
            }
        };
        let rX = 90 - 180 * (quan / (arr.length - 1));
        // rotateY的变化 由他是第几圈第几个决定
        let rY = 360 / arr[quan] * ge + arr[quan] * 100;
        return `rotateY(${rY}deg) rotateX(${rX}deg) translateZ(800px)`;
    };

    // 8.事件添加
    (() => {
        /**
         *  分析：
         *      鼠标水平方向的拖拽 改变ul的rotateY
         *      鼠标垂直方向的拖拽 改变ul的rotateX
         */

        //  设置一个开关
        let ifDown = false;
        // 初始化 按下时xy坐标 移动时xy坐标 xy变化量 
        let dX, dY, mX, mY, x_, y_;
        // 提前定义出ul的变换初始值
        let tZ = -3000,
            rX = 0,
            rY = 0;

        // 添加鼠标事件
        // 点击
        $(document).mousedown(function (e) {
            // 打开开关
            ifDown = true;
            $("body").css("cursor", "pointer");
            // 获取点击时鼠标的坐标
            dX = mX = e.pageX;
            dY = mY = e.pageY;
        });

        // 移动
        $(document).mousemove(function (e) {
            // 判断开关是否打开 没打开就不继续执行
            if (!ifDown) return;
            // 获取鼠标x y轴变化量
            x_ = e.pageX - mX;
            y_ = e.pageY - mY;
            // 储存当前坐标便于下一次计算
            mX = e.pageX;
            mY = e.pageY;
            // 根据变化量来计算x y轴旋转角度 *0.2是为了不让拖动1px就旋转1°使得旋转幅度过大
            rX += y_ * -0.2;
            rY += x_ * 0.2;
            oUl.style.transform = `translateZ(${tZ}px) rotateX(${rX}deg) rotateY(${rY}deg)`;
        });

        // 松开
        $(document).mouseup(function (e) {
            // 将开关关闭
            ifDown = false;
            $("body").css("cursor", "default");
        });

        // 滚轮事件
        mousewheel(document, function (e, d) {
            // d的值只有可能是1或-1
            // 1向上 -1向下
            tZ += d * 200;
            oUl.style.transform = `translateZ(${tZ}px) rotateX(${rX}deg) rotateY(${rY}deg)`;
            // 因为拉的太近/太远会使得效果很丑 所以需要限制一下最大最小值
            tZ = Math.min(tZ, 400);
            tZ = Math.max(tZ, -5000);
        });
        // 兼容webkit、firefox
        function mousewheel(DOM, FN) {
            // webkit：上滚正 下滚负
            DOM.addEventListener("mousewheel", function (e) {
                // 获取滚动值 
                let d = e.wheelDelta;
                // 用当前滚轮值除以绝对值 去掉具体数值 获得1或-1
                FN(e, d / Math.abs(d));
            });
            // firefox： 上滚负 下滚正
            DOM.addEventListener("DOMMouseScroll", function (e) {
                // 获取滚动值
                let d = e.detail;
                // 因为他上滚下滚获得的正负值 与webkit正好相反 所以我们直接给他一个负号 变得和webkit一样
                FN(e, -d / Math.abs(d));
            });
        };
    })();

    // 9.更换布局
    (() => {
        // 直接委派事件
        $Btn.on("click", "nav", function () {
            // 直接改变ul名字改变样式
            oUl.className = this.innerHTML;
        });
    })();
});