    // ==UserScript==
// @name         武林英雄脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  武林英雄游戏脚本
// @author       You
// @match        http://*.hero.9wee.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // 添加悬浮窗样式
    GM_addStyle(`
        #myFloatingWindow {
            position: fixed;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            background-color: #fff;
            border: 1px solid #000;
            padding: 10px;
            z-index: 1000;
        }
        #myFloatingWindow .module-group {
            margin-bottom: 10px;
        }
        #myFloatingWindow .module-title {
            font-weight: bold;
            cursor: pointer;
        }
        #myFloatingWindow .module-list li {
            margin-bottom: 5px;
        }
    `);

    // 创建悬浮窗
    let floatingWindow = document.createElement('div');
    floatingWindow.id = 'myFloatingWindow';
    floatingWindow.innerHTML = `
        <h2>武林英雄脚本</h2>
        <div class="module-group" data-module-group="main">
            <div class="module-title" data-module="wuhun">武魂</div>
            <div class="module-title" data-module="daily">日常</div>
        </div>
        <div class="module-group" data-module-group="wuhun" style="display:none;">
            <ul class="module-list">
                <li>抽取武魂黄金经验宝石 <button class="execute-button" data-action="extractWuhun">执行</button></li>
                <li>武魂宝石升级 <button class="execute-button" data-action="upgradeGem">执行</button></li>
                <li>武魂经验一键训练 <input type="number" class="train-times" value="0" min="0" max="100" style="width: 40px;"> <button class="execute-button" data-action="trainWuhun">执行</button></li>
                <li>一键培养 
                    <div style="margin: 5px 0;">
                        <label><input type="checkbox" class="foster-attr" value="str"> 臂力</label>
                        <label><input type="checkbox" class="foster-attr" value="dex"> 身法</label>
                        <label><input type="checkbox" class="foster-attr" value="vit"> 根骨</label>
                    </div>
                    <div style="margin: 5px 0;">
                        最多次数: <input type="number" class="foster-times" value="0" min="0" max="1000" style="width: 50px;">
                    </div>
                    <button class="execute-button" data-action="fosterWuhun">执行</button>
                </li>
            </ul>
            <button id="back-button">返回</button>
        </div>
        <div class="module-group" data-module-group="daily" style="display:none;">
            <ul class="module-list">
                <li>武器幻化 <button class="execute-button" data-action="weaponDisplace">执行</button></li>
                <li>厉兵秣马 <button class="execute-button" data-action="horseTraining">执行</button></li>
                <li>先天元神 <button class="execute-button" data-action="meridianTraining">执行</button></li>
                <li>冲锋陷阵 <button class="execute-button" data-action="diagramTraining">执行</button></li>
                <li>星辰抽取 <button class="execute-button" data-action="totemExtract">执行</button></li>
            </ul>
            <button id="back-button">返回</button>
        </div>
    `;
    document.body.appendChild(floatingWindow);

    // 添加事件监听
    floatingWindow.querySelector('[data-module="wuhun"]').addEventListener('click', function() {
        floatingWindow.querySelector('[data-module-group="main"]').style.display = 'none';
        floatingWindow.querySelector('[data-module-group="wuhun"]').style.display = 'block';
    });
    
    floatingWindow.querySelector('[data-module="daily"]').addEventListener('click', function() {
        floatingWindow.querySelector('[data-module-group="main"]').style.display = 'none';
        floatingWindow.querySelector('[data-module-group="daily"]').style.display = 'block';
    });
    
    // 返回按钮事件 - 修复多个返回按钮的问题
    floatingWindow.querySelectorAll('#back-button').forEach(button => {
        button.addEventListener('click', function() {
            floatingWindow.querySelector('[data-module-group="wuhun"]').style.display = 'none';
            floatingWindow.querySelector('[data-module-group="daily"]').style.display = 'none';
            floatingWindow.querySelector('[data-module-group="main"]').style.display = 'block';
        });
    });

    // 执行按钮点击事件
    floatingWindow.querySelectorAll('.execute-button').forEach(button => {
        button.addEventListener('click', function() {
            let action = this.dataset.action;
            switch (action) {
                case 'extractWuhun':
                    extractWuhunGoldExp();
                    break;
                case 'upgradeGem':
                    if (this.textContent === '执行') {
                        this.textContent = '停止';
                        this.dataset.running = 'true';
                        upgradeGem(this);
                    } else {
                        this.textContent = '执行';
                        this.dataset.running = 'false';
                    }
                    break;
                case 'trainWuhun':
                    if (this.textContent === '执行') {
                        this.textContent = '停止';
                        this.dataset.running = 'true';
                        const trainTimesInput = floatingWindow.querySelector('.train-times');
                        const trainTimes = parseInt(trainTimesInput.value) || 0;
                        trainWuhun(this, trainTimes);
                    } else {
                        this.textContent = '执行';
                        this.dataset.running = 'false';
                    }
                    break;
                case 'fosterWuhun':
                    if (this.textContent === '执行') {
                        this.textContent = '停止';
                        this.dataset.running = 'true';
                        const fosterTimesInput = floatingWindow.querySelector('.foster-times');
                        const fosterTimes = parseInt(fosterTimesInput.value) || 0;
                        const fosterAttrs = Array.from(floatingWindow.querySelectorAll('.foster-attr')).filter(attr => attr.checked).map(attr => attr.value);
                        fosterWuhun(button, fosterTimes, fosterAttrs);
                    } else {
                        this.textContent = '执行';
                        this.dataset.running = 'false';
                    }
                    break;
                case 'weaponDisplace':
                    if (this.textContent === '执行') {
                        this.textContent = '停止';
                        this.dataset.running = 'true';
                        weaponDisplace();
                    } else {
                        this.textContent = '执行';
                        this.dataset.running = 'false';
                    }
                    break;
                case 'horseTraining':
                    if (this.textContent === '执行') {
                        this.textContent = '停止';
                        this.dataset.running = 'true';
                        horseTraining();
                    } else {
                        this.textContent = '执行';
                        this.dataset.running = 'false';
                    }
                    break;
                case 'meridianTraining':
                    if (this.textContent === '执行') {
                        this.textContent = '停止';
                        this.dataset.running = 'true';
                        meridianTraining();
                    } else {
                        this.textContent = '执行';
                        this.dataset.running = 'false';
                    }
                    break;
                case 'diagramTraining':
                    if (this.textContent === '执行') {
                        this.textContent = '停止';
                        this.dataset.running = 'true';
                        diagramTraining();
                    } else {
                        this.textContent = '执行';
                        this.dataset.running = 'false';
                    }
                    break;
                case 'totemExtract':
                    if (this.textContent === '执行') {
                        this.textContent = '停止';
                        this.dataset.running = 'true';
                        totemExtract();
                    } else {
                        this.textContent = '执行';
                        this.dataset.running = 'false';
                    }
                    break;
                default:
                    alert('未知功能');
            }
        });
    });

    // 抽取武魂黄金经验宝石功能
    function extractWuhunGoldExp() {
        // 检查是否在武魂宝石页面
        if (!document.querySelector('.dlg_title') || !document.querySelector('.dlg_title').textContent.includes('武魂宝石')) {
            alert('请先进入武魂宝石页面！');
            return;
        }

        // 查找黄金经验按钮
        const goldExpButton = Array.from(document.querySelectorAll('input[type="button"]')).find(el => 
            el.value === '黄金经验'
        );

        if (!goldExpButton) {
            alert('未找到黄金经验按钮，请确认当前页面是否正确！');
            return;
        }

        // 获取剩余免费次数
        let freeTimesLeft = 0;
        let totalTimesLeft = 0;
        
        if (goldExpButton.hasAttribute('titlecontent')) {
            const titleContent = goldExpButton.getAttribute('titlecontent');
            const freeTimesMatch = titleContent.match(/本日剩余免费抽取次数：\s*(\d+)/);
            const totalTimesMatch = titleContent.match(/本日剩余次数：\s*(\d+)/);
            
            if (freeTimesMatch && freeTimesMatch[1]) {
                freeTimesLeft = parseInt(freeTimesMatch[1]);
            }
            
            if (totalTimesMatch && totalTimesMatch[1]) {
                totalTimesLeft = parseInt(totalTimesMatch[1]);
            }
        }

        // 如果没有剩余次数，提示用户
        if (totalTimesLeft <= 0) {
            alert('今日已无剩余抽取次数！');
            return;
        }

        // 点击黄金经验按钮
        goldExpButton.click();
        
        // 等待弹窗出现并自动确认
        setTimeout(() => {
            // 使用用户提供的精确选择器查找确认按钮
            let confirmButton = document.querySelector('#dialog_box1 > table > tbody > tr > td > div.dlg_border > div > div > div > div > div > div > form > table > tbody > tr:nth-child(2) > td > input');
            
            // 如果没找到，尝试更宽松的选择器
            if (!confirmButton) {
                confirmButton = document.querySelector('#dialog_box1 input[value="确定"]');
            }
            
            // 如果还没找到，尝试查找任何值为"确定"的输入元素
            if (!confirmButton) {
                confirmButton = document.querySelector('input[value="确定"]');
            }
            
            // 如果还没找到，尝试查找任何包含"确定"文本的按钮元素
            if (!confirmButton) {
                const allButtons = document.querySelectorAll('input[type="button"], input[type="submit"], button');
                for (const btn of allButtons) {
                    if (btn.value === '确定' || btn.textContent === '确定') {
                        confirmButton = btn;
                        break;
                    }
                }
            }
            
            if (confirmButton) {
                confirmButton.click();
                
                // 等待抽取结果显示并处理下一次抽取
                setTimeout(() => {
                    // 检查是否有新的确认按钮出现（例如结果提示框）
                    let resultConfirmButton = document.querySelector('input[value="确定"]');
                    if (resultConfirmButton) {
                        resultConfirmButton.click();
                    }
                    
                    // 再次检查剩余次数
                    const updatedGoldExpButton = Array.from(document.querySelectorAll('input[type="button"]')).find(el => 
                        el.value === '黄金经验'
                    );
                    
                    if (updatedGoldExpButton && updatedGoldExpButton.hasAttribute('titlecontent')) {
                        const titleContent = updatedGoldExpButton.getAttribute('titlecontent');
                        const freeTimesMatch = titleContent.match(/本日剩余免费抽取次数：\s*(\d+)/);
                        const totalTimesMatch = titleContent.match(/本日剩余次数：\s*(\d+)/);
                        
                        let updatedFreeTimesLeft = 0;
                        let updatedTotalTimesLeft = 0;
                        
                        if (freeTimesMatch && freeTimesMatch[1]) {
                            updatedFreeTimesLeft = parseInt(freeTimesMatch[1]);
                        }
                        
                        if (totalTimesMatch && totalTimesMatch[1]) {
                            updatedTotalTimesLeft = parseInt(totalTimesMatch[1]);
                        }
                        
                        // 如果还有免费次数，自动继续抽取
                        if (updatedFreeTimesLeft > 0) {
                            setTimeout(extractWuhunGoldExp, 500);
                        } else {
                            alert('所有次数已用完！');
                        }
                    }
                }, 1000); // 等待1秒，确保结果显示
            }
        }, 500);
    }

    // 武魂宝石升级功能
    function upgradeGem(button) {
        // 检查是否在武魂宝石页面
        if (!document.querySelector('.dlg_title') || !document.querySelector('.dlg_title').textContent.includes('武魂宝石')) {
            alert('请先进入武魂宝石页面！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 检查按钮状态，如果不是运行状态则退出
        if (button.dataset.running !== 'true') {
            return;
        }

        // 1. 一键抽取宝石
        try {
            if (typeof gemTempOperate === 'function') {
                gemTempOperate(2, 'autoext');
            } else {
                unsafeWindow.gemTempOperate(2, 'autoext');
            }
        } catch (e) {
            alert('执行一键抽取宝石失败，请确认当前页面是否正确！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 等待抽取完成后执行下一步
        setTimeout(() => {
            // 2. 一键卖出无用宝石
            try {
                if (typeof gemTempOperate === 'function') {
                    gemTempOperate(5, 'sellGarbagGem');
                } else {
                    unsafeWindow.gemTempOperate(5, 'sellGarbagGem');
                }
            } catch (e) {
                // 错误处理，但不输出日志
            }

            // 等待卖出完成后执行下一步
            setTimeout(() => {
                // 3. 一键把宝石入包
                try {
                    if (typeof gemTempOperate === 'function') {
                        gemTempOperate(3, 'ToPackAuto');
                    } else {
                        unsafeWindow.gemTempOperate(3, 'ToPackAuto');
                    }
                } catch (e) {
                    // 错误处理，但不输出日志
                }

                // 等待入包完成后执行下一步
                setTimeout(() => {
                    // 4. 打开背包
                    try {
                        if (typeof gemTempOperate === 'function') {
                            gemTempOperate(4, 'openPack');
                        } else {
                            unsafeWindow.gemTempOperate(4, 'openPack');
                        }
                    } catch (e) {
                        // 错误处理，但不输出日志
                    }

                    // 等待背包打开后执行下一步
                    setTimeout(() => {
                        // 5. 一键吞噬宝石
                        try {
                            if (typeof gem_Synthesis_act === 'function') {
                                gem_Synthesis_act();
                            } else {
                                unsafeWindow.gem_Synthesis_act();
                            }
                        } catch (e) {
                            // 错误处理，但不输出日志
                        }

                        // 等待吞噬完成后获取宝石经验
                        setTimeout(() => {
                            // 6. 获取宝石经验
                            let gemExp = '未知';
                            try {
                                // 尝试通过XPath获取宝石元素
                                const xpathResult = document.evaluate('//*[@id="gem_1"]/img', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                                const gemImg = xpathResult.singleNodeValue;
                                
                                // 如果找不到，尝试通过选择器获取
                                if (!gemImg) {
                                    const gemImgAlt = document.querySelector('#gem_1 img');
                                    if (gemImgAlt) {
                                        gemImg = gemImgAlt;
                                    }
                                }
                                
                                if (gemImg && gemImg.hasAttribute('titlecontent')) {
                                    const titleContent = gemImg.getAttribute('titlecontent');
                                    const expMatch = titleContent.match(/宝石经验:(\d+)\/(\d+)/);
                                    if (expMatch && expMatch[1] && expMatch[2]) {
                                        const currentExp = parseInt(expMatch[1]);
                                        const maxExp = parseInt(expMatch[2]);
                                        gemExp = `${currentExp}/${maxExp} (${Math.round(currentExp/maxExp*100)}%)`;
                                    }
                                }
                            } catch (e) {
                                // 错误处理，但不输出日志
                            }
                            
                            // 如果按钮仍处于运行状态，则继续循环
                            if (button.dataset.running === 'true') {
                                setTimeout(() => upgradeGem(button), 150);
                            }
                        }, 150);
                    }, 150);
                }, 150);
            }, 150);
        }, 150);
    }

    // 一键训练功能
    function trainWuhun(button, trainTimes) {
        // 检查是否在武魂训练页面
        if (!document.querySelector('.dlg_title') || !document.querySelector('.dlg_title').textContent.includes('武魂训练')) {
            alert('请先进入武魂训练页面！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 检查按钮状态，如果不是运行状态则退出
        if (button.dataset.running !== 'true') {
            return;
        }

        // 获取当前武魂ID
        let soulId = '';
        try {
            const xpathResult = document.evaluate('//*[@id="soul_name_select_0"]/option[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const soulOption = xpathResult.singleNodeValue;
            
            if (soulOption && soulOption.hasAttribute('value')) {
                soulId = soulOption.getAttribute('value');
            } else {
                // 如果找不到，尝试其他方式
                const soulSelect = document.querySelector('#soul_name_select_0');
                if (soulSelect && soulSelect.options && soulSelect.options.length > 1) {
                    soulId = soulSelect.options[1].value;
                }
            }
            
            if (!soulId) {
                alert('未能获取武魂ID，请确认当前页面是否正确！');
                button.textContent = '执行';
                button.dataset.running = 'false';
                return;
            }
        } catch (e) {
            alert('获取武魂ID失败，请确认当前页面是否正确！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 记录当前已执行次数
        let currentCount = 0;
        
        // 执行训练流程
        function executeTraining() {
            // 如果按钮状态变更，则停止
            if (button.dataset.running !== 'true') {
                button.textContent = '执行';
                button.dataset.running = 'false';
                return;
            }
            
            // 如果已达到指定次数且指定次数不为0，则停止
            if (trainTimes > 0 && currentCount >= trainTimes) {
                button.textContent = '执行';
                button.dataset.running = 'false';
                return;
            }
            
            // 1. 开启训练
            try {
                if (typeof clsSoul === 'function' || typeof clsSoul === 'object') {
                    if (typeof clsSoul.open === 'function') {
                        unsafeWindow.clsSoul.open(`act=train&op=start&mirror_type=0&add_exp_mult_flag=0&new_soul_train_type=2&soul_id=${soulId}&hour=48`);
                    } else {
                        eval(`unsafeWindow.clsSoul.open("act=train&op=start&mirror_type=0&add_exp_mult_flag=0&new_soul_train_type=2&soul_id=${soulId}&hour=48")`);
                    }
                    
                    if (typeof dialog !== 'undefined' && typeof dialog.close === 'function') {
                        unsafeWindow.dialog.close();
                    }
                } else {
                    eval(`
                        unsafeWindow.clsSoul.open("act=train&op=start&mirror_type=0&add_exp_mult_flag=0&new_soul_train_type=2&soul_id=${soulId}&hour=48"); 
                        unsafeWindow.dialog.close();
                    `);
                }
            } catch (e) {
                console.error('执行开始训练失败:', e);
            }
            
            // 2. 点击"立即完成"按钮
            setTimeout(() => {
                try {
                    // 通过XPath查找"立即完成"按钮
                    const xpathResult = document.evaluate('//*[@id="dlg_soul_train"]/table/tbody/tr/td/div[1]/div/div/div/div/div/div/div/div/table/tbody/tr/td[4]/input[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                    const completeButton = xpathResult.singleNodeValue;
                    
                    // 如果找不到，尝试通过value属性查找
                    if (!completeButton) {
                        const allButtons = document.querySelectorAll('input[type="button"]');
                        for (const btn of allButtons) {
                            if (btn.value === '立即完成') {
                                completeButton = btn;
                                break;
                            }
                        }
                    }
                    
                    if (completeButton) {
                        completeButton.click();
                    } else {
                        console.error('未找到立即完成按钮');
                        // 继续下一次训练
                        currentCount++;
                        setTimeout(executeTraining, 250);
                        return;
                    }
                } catch (e) {
                    console.error('点击立即完成按钮失败:', e);
                    // 继续下一次训练
                    currentCount++;
                    setTimeout(executeTraining, 250);
                    return;
                }
                
                // 3. 检查是否有免费立即完成的机会并点击确定按钮
                setTimeout(() => {
                    try {
                        // 查找确认对话框
                        const dialogContent = document.querySelector('#dialog_box1 .dlg_content');
                        
                        // 提取剩余免费次数
                        let freeTimesLeft = 0;
                        if (dialogContent) {
                            // 尝试从HTML内容中提取
                            const htmlContent = dialogContent.innerHTML || '';
                            const freeTimesMatch = htmlContent.match(/当前你还有<span[^>]*>(\d+)<\/span>次免费使用立即完成机会/);
                            if (freeTimesMatch && freeTimesMatch[1]) {
                                freeTimesLeft = parseInt(freeTimesMatch[1]);
                            } else {
                                // 尝试从文本内容中提取
                                const textContent = dialogContent.textContent || '';
                                const textMatch = textContent.match(/当前你还有\s*(\d+)\s*次免费使用立即完成机会/);
                                if (textMatch && textMatch[1]) {
                                    freeTimesLeft = parseInt(textMatch[1]);
                                }
                            }
                        }
                        
                        // 保存剩余免费次数，供后续使用
                        window.freeTrainTimesLeft = freeTimesLeft;
                        
                        // 检查是否有免费次数
                        if (dialogContent && dialogContent.textContent.includes('次免费使用立即完成机会')) {
                            // 查找确定按钮
                            const confirmButton = dialogContent.querySelector('input[value="确定"]');
                            if (confirmButton) {
                                confirmButton.click();
                            } else {
                                console.error('未找到确定按钮');
                                // 继续下一次训练
                                currentCount++;
                                setTimeout(executeTraining, 250);
                                return;
                            }
                        } else {
                            console.log('没有免费立即完成的机会，停止训练');
                            // 点击取消按钮
                            const cancelButton = document.querySelector('#dialog_box1 input[value="取消"]');
                            if (cancelButton) {
                                cancelButton.click();
                            }
                            // 训练完成，停止循环
                            button.textContent = '执行';
                            button.dataset.running = 'false';
                            return;
                        }
                    } catch (e) {
                        console.error('检查免费次数失败:', e);
                        // 继续下一次训练
                        currentCount++;
                        setTimeout(executeTraining, 250);
                        return;
                    }
                    
                    // 4. 点击训练完成后的确认按钮
                    setTimeout(() => {
                        try {
                            // 查找训练完成的确认按钮
                            const finalConfirmButton = document.querySelector('#dialog_box1 input[value="确定"]');
                            if (finalConfirmButton) {
                                finalConfirmButton.click();
                            }
                        } catch (e) {
                            console.error('点击最终确认按钮失败:', e);
                        }
                        
                        // 获取当前五行经验
                        setTimeout(() => {
                            try {
                                // 尝试通过XPath获取五行经验元素
                                const xpathResult = document.evaluate('//*[@id="column_show_left"]/div/div[2]/table/tbody/tr[6]/td/div/p', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                                const expBar = xpathResult.singleNodeValue;
                                
                                let expText = '未知';
                                if (expBar && expBar.hasAttribute('titlecontent')) {
                                    const titleContent = expBar.getAttribute('titlecontent');
                                    const expMatch = titleContent.match(/当前五行经验：(\d+)\s*\/\s*(\d+)/);
                                    if (expMatch && expMatch[1] && expMatch[2]) {
                                        const currentExp = parseInt(expMatch[1]);
                                        const maxExp = parseInt(expMatch[2]);
                                        expText = `${currentExp}/${maxExp} (${Math.round(currentExp/maxExp*100)}%)`;
                                    }
                                }
                                
                                // 输出当前五行经验
                                console.log(`当前五行经验: ${expText} - 已训练 ${++currentCount}/${trainTimes > 0 ? trainTimes : '∞'} 次 - 剩余免费次数: ${window.freeTrainTimesLeft || 0}`);
                                
                                // 继续下一次训练
                                setTimeout(executeTraining, 250);
                            } catch (e) {
                                console.error('获取五行经验失败:', e);
                                // 即使获取经验失败，也继续下一次训练
                                currentCount++;
                                setTimeout(executeTraining, 250);
                            }
                        }, 250);
                    }, 250);
                }, 250);
            }, 250);
        }
        
        // 开始执行训练流程
        executeTraining();
    }

    // 一键培养功能
    function fosterWuhun(button, fosterTimes, fosterAttrs) {
        // 检查是否选择了属性
        if (fosterAttrs.length === 0) {
            alert('请至少选择一个要培养的属性（臂力、身法或根骨）！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }
        
        // 检查是否在培养页面
        if (!document.querySelector('.dlg_title') || !document.querySelector('.dlg_title').textContent.includes('培养')) {
            alert('请先进入武魂培养页面！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 检查按钮状态，如果不是运行状态则退出
        if (button.dataset.running !== 'true') {
            return;
        }

        // 记录当前已执行次数和成功率统计
        let currentCount = 0;
        let saveCount = 0;
        let giveupCount = 0;
        
        // 执行培养流程
        function executeFoster() {
            // 如果按钮状态变更，则停止
            if (button.dataset.running !== 'true') {
                button.textContent = '执行';
                button.dataset.running = 'false';
                return;
            }
            
            // 如果已达到指定次数且指定次数不为0，则停止
            if (fosterTimes > 0 && currentCount >= fosterTimes) {
                const successRate = currentCount > 0 ? (saveCount / currentCount * 100).toFixed(2) : 0;
                console.log(`培养完成：总次数 ${currentCount}，保存 ${saveCount}，放弃 ${giveupCount}，成功率 ${successRate}%`);
                button.textContent = '执行';
                button.dataset.running = 'false';
                return;
            }
            
            // 获取原始属性值
            const rows = document.querySelectorAll('.role_points table:nth-of-type(2) tbody tr');
            if (rows.length < 3) {
                console.error('未找到属性行');
                setTimeout(executeFoster, 100);
                return;
            }
            
            // 获取属性上限
            let attrLimit = 0;
            const limitText = document.querySelector('.role_points p.highlight');
            if (limitText) {
                const limitMatch = limitText.textContent.match(/上限为(\d+)/);
                if (limitMatch && limitMatch[1]) {
                    attrLimit = parseInt(limitMatch[1]);
                }
            }
            
            // 检查是否有选中的属性已满
            let fullSelectedAttrCount = 0;
            
            // 属性名称映射
            const attrNames = ['str', 'dex', 'vit'];
            
            // 保存原始属性值和新属性值
            const originalAttrs = {};
            const newAttrs = {};
            
            // 遍历三个属性行
            for (let i = 0; i < 3; i++) {
                const row = rows[i];
                const attrName = attrNames[i];
                
                // 获取原始属性值 - 从第一个单元格获取
                let originalValue = 0;
                const originalSpan = row.querySelector('td:first-child .small_font');
                if (originalSpan) {
                    originalValue = parseInt(originalSpan.textContent) || 0;
                }
                
                // 检查是否有"（满）"标记
                const specialSpan = row.querySelector('td:first-child .small_font.highlight, td:first-child .small_font.special');
                if (specialSpan && (specialSpan.textContent.includes('（满）') || specialSpan.textContent.includes('满'))) {
                    // 只有当这个已满的属性是用户选中的属性时才计数
                    if (fosterAttrs.includes(attrName)) {
                        fullSelectedAttrCount++;
                    }
                }
                
                // 保存原始属性值
                originalAttrs[attrName] = originalValue;
            }
            
            // 如果所有选中的属性都已满，则提示用户并停止
            if (fosterAttrs.length > 0 && fullSelectedAttrCount >= fosterAttrs.length) {
                alert('所有选中的属性都已达到上限，停止培养');
                button.textContent = '执行';
                button.dataset.running = 'false';
                return;
            }
            
            // 1. 点击培养按钮
            try {
                // 通过XPath查找培养按钮
                const xpathResult = document.evaluate('//*[@id="foster_button_ok"]/input', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const fosterButton = xpathResult.singleNodeValue;
                
                // 如果找不到，尝试通过value属性查找
                if (!fosterButton) {
                    const allButtons = document.querySelectorAll('input[type="submit"]');
                    for (const btn of allButtons) {
                        if (btn.value === '培养') {
                            fosterButton = btn;
                            break;
                        }
                    }
                }
                
                if (fosterButton) {
                    fosterButton.click();
                    currentCount++;
                } else {
                    console.error('未找到培养按钮');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
            } catch (e) {
                console.error('点击培养按钮失败:', e);
                button.textContent = '执行';
                button.dataset.running = 'false';
                return;
            }
            
            // 2. 获取培养结果并决定是保存还是放弃
            setTimeout(() => {
                try {
                    // 获取培养容器
                    const fosterContainer = document.querySelector('#dlg_soul_foster .container.dlg_train_soul');
                    if (!fosterContainer) {
                        console.error('未找到培养容器');
                        setTimeout(executeFoster, 100);
                        return;
                    }
                    
                    // 获取新属性值
                    const newRows = fosterContainer.querySelectorAll('table:last-child tbody tr');
                    if (newRows.length < 3) {
                        console.error('未找到新属性行');
                        setTimeout(executeFoster, 100);
                        return;
                    }
                    
                    // 保存新属性值
                    for (let i = 0; i < 3; i++) {
                        const row = newRows[i];
                        const attrName = attrNames[i];
                        
                        // 获取新属性值 - 从第二个单元格获取
                        let newValue = 0;
                        let newAddValue = 0;
                        const newSpan = row.querySelector(`td:nth-child(2) #foster_save_${attrName}`);
                        if (newSpan) {
                            // 获取基础值
                            const newBaseSpan = newSpan.querySelector('.small_font:not(.special)');
                            if (newBaseSpan) {
                                newValue = parseInt(newBaseSpan.textContent) || 0;
                            }
                            
                            // 获取增长值
                            const newAddSpan = newSpan.querySelector('.small_font.special');
                            if (newAddSpan) {
                                const addMatch = newAddSpan.textContent.match(/\+(\d+)/);
                                if (addMatch && addMatch[1]) {
                                    newAddValue = parseInt(addMatch[1]);
                                }
                            }
                        }
                        
                        // 如果没有获取到新值，使用原值
                        if (newValue === 0) {
                            newValue = originalAttrs[attrName];
                        }
                        
                        // 保存属性值和增长值
                        newAttrs[attrName] = newValue;
                        newAttrs[attrName + '_add'] = newAddValue;
                    }
                    
                    // 判断是否应该保存
                    let shouldSave = true; // 默认保存
                    
                    // 只要有任何属性有增长，且选中的属性没有变差，就保存
                    let anyAttrImproved = false;
                    for (const attr of ['str', 'dex', 'vit']) {
                        if (newAttrs[attr + '_add'] > 0) {
                            anyAttrImproved = true;
                            break;
                        }
                    }
                    
                    // 如果没有任何属性有增长，则放弃
                    if (!anyAttrImproved) {
                        shouldSave = false;
                    } else {
                        // 检查选中的属性是否有任何一个属性没有增长
                        for (const attr of fosterAttrs) {
                            if (newAttrs[attr + '_add'] <= 0) {
                                shouldSave = false;
                                break;
                            }
                        }
                    }
                    
                    // 决定保存还是放弃
                    setTimeout(() => {
                        try {
                            // 找出当前最高增长值
                            let highestAttr = 0;
                            for (const attr of ['str', 'dex', 'vit']) {
                                if (newAttrs[attr + '_add'] > highestAttr) {
                                    highestAttr = newAttrs[attr + '_add'];
                                }
                            }
                            
                            if (shouldSave) {
                                // 点击保存按钮
                                const saveButton = document.querySelector('#foster_button_save input[value="保存"]');
                                if (saveButton) {
                                    saveButton.click();
                                    saveCount++;
                                    
                                    // 输出保存信息
                                    let attrChanges = [];
                                    if (fosterAttrs.includes('str')) {
                                        attrChanges.push(`臂力: +${newAttrs.str_add || 0}`);
                                    }
                                    if (fosterAttrs.includes('dex')) {
                                        attrChanges.push(`身法: +${newAttrs.dex_add || 0}`);
                                    }
                                    if (fosterAttrs.includes('vit')) {
                                        attrChanges.push(`根骨: +${newAttrs.vit_add || 0}`);
                                    }
                                    
                                    const successRate = (saveCount / currentCount * 100).toFixed(2);
                                    console.log(`第 ${currentCount} 次培养 - 保存 - 最高增长: +${highestAttr}/${attrLimit} - ${attrChanges.join(', ')} - 成功率: ${successRate}% (${saveCount}/${currentCount})`);
                                } else {
                                    console.error('未找到保存按钮');
                                }
                            } else {
                                // 点击放弃按钮
                                const giveupButton = document.querySelector('#foster_button_save input[value="放弃"]');
                                if (giveupButton) {
                                    giveupButton.click();
                                    giveupCount++;
                                    
                                    // 输出放弃信息
                                    let attrChanges = [];
                                    if (fosterAttrs.includes('str')) {
                                        attrChanges.push(`臂力: +${newAttrs.str_add || 0}`);
                                    }
                                    if (fosterAttrs.includes('dex')) {
                                        attrChanges.push(`身法: +${newAttrs.dex_add || 0}`);
                                    }
                                    if (fosterAttrs.includes('vit')) {
                                        attrChanges.push(`根骨: +${newAttrs.vit_add || 0}`);
                                    }
                                    
                                    const successRate = currentCount > 0 ? (saveCount / currentCount * 100).toFixed(2) : 0;
                                    console.log(`第 ${currentCount} 次培养 - 放弃 - 最高增长: +${highestAttr}/${attrLimit} - ${attrChanges.join(', ')} - 成功率: ${successRate}% (${saveCount}/${currentCount})`);
                                } else {
                                    console.error('未找到放弃按钮');
                                }
                            }
                            
                            // 继续下一次培养
                            setTimeout(executeFoster, 100);
                        } catch (e) {
                            console.error('保存或放弃培养失败:', e);
                            setTimeout(executeFoster, 100);
                        }
                    }, 250);
                } catch (e) {
                    console.error('获取培养结果失败:', e);
                    setTimeout(executeFoster, 100);
                }
            }, 100);
        }
        
        // 开始执行培养流程
        executeFoster();
    }

    // 武器幻化功能
    function weaponDisplace() {
        const button = document.querySelector('button[data-action="weaponDisplace"]');
        if (!button || button.textContent === '执行') {
            return;
        }
        
        // 检查是否在武器库页面
        let isInWeaponPage = false;
        
        // 方法1：检查URL
        if (window.location.href.includes('displace.php')) {
            isInWeaponPage = true;
        }
        
        // 方法2：检查页面元素
        if (!isInWeaponPage) {
            // 尝试查找武器幻化相关元素
            if (document.getElementById('get_times') && document.getElementById('max_get_times')) {
                isInWeaponPage = true;
            }
        }
        
        // 方法3：检查菜单高亮
        if (!isInWeaponPage) {
            const menuLinks = document.querySelectorAll('#main_menu a');
            for (const link of menuLinks) {
                if (link.textContent.includes('武器库') && link.classList.contains('highlight')) {
                    isInWeaponPage = true;
                    break;
                }
            }
        }
        
        if (!isInWeaponPage) {
            alert('请先进入武器库页面！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 执行幻化流程
        function executeDisplace() {
            // 如果已停止，则不继续执行
            if (button.textContent === '执行') {
                return;
            }
            
            // 获取剩余次数
            try {
                const timesElement = document.getElementById('get_times');
                const maxTimesElement = document.getElementById('max_get_times');
                
                if (!timesElement || !maxTimesElement) {
                    console.error('未找到次数元素');
                    setTimeout(executeDisplace, 250);
                    return;
                }
                
                const usedTimes = parseInt(timesElement.textContent);
                const maxTimesText = maxTimesElement.textContent;
                // 从"150周"中提取数字部分
                const maxTimesMatch = maxTimesText.match(/(\d+)/);
                const maxTimes = maxTimesMatch ? parseInt(maxTimesMatch[1]) : 0;
                
                const remainingTimes = maxTimes - usedTimes;
                
                console.log(`武器幻化 - 剩余次数: ${remainingTimes}/${maxTimes} (已使用: ${usedTimes})`);
                
                // 如果次数已用完，停止执行
                if (remainingTimes <= 0) {
                    alert('武器幻化 - 次数已用完，停止执行');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 执行幻化操作
                const rand = Date.now();
                // 使用unsafeWindow访问页面中的loader对象
                const loader = unsafeWindow.loader;
                if (loader) {
                    loader.get(`/modules/displace.php?act=get&type=4&rand=${rand}`, null, null, null, 'displace_call_back');
                    // console.log(`武器幻化 - 执行第 ${usedTimes + 1} 次幻化`);
                } else {
                    console.error('未找到loader对象');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 等待一段时间后继续下一次幻化
                setTimeout(executeDisplace, 500);
            } catch (e) {
                console.error('武器幻化执行失败:', e);
                setTimeout(executeDisplace, 500);
            }
        }
        
        // 开始执行幻化流程
        executeDisplace();
    }

    // 厉兵秣马功能
    function horseTraining() {
        const button = document.querySelector('button[data-action="horseTraining"]');
        if (!button || button.textContent === '执行') {
            return;
        }
        
        // 检查是否在战马页面
        let isInHorsePage = false;
        
        // 方法1：检查URL
        if (window.location.href.includes('horsees.php')) {
            isInHorsePage = true;
        }
        
        // 方法2：检查页面元素
        if (!isInHorsePage) {
            // 尝试查找战马相关元素
            if (document.getElementById('get_free') && document.getElementById('max_get_free')) {
                isInHorsePage = true;
            }
        }
        
        // 方法3：检查菜单高亮
        if (!isInHorsePage) {
            const menuLinks = document.querySelectorAll('#main_menu a');
            for (const link of menuLinks) {
                if (link.textContent.includes('战马') && link.classList.contains('highlight')) {
                    isInHorsePage = true;
                    break;
                }
            }
        }
        
        if (!isInHorsePage) {
            alert('请先进入战马页面！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 执行厉兵秣马流程
        function executeHorseTraining() {
            // 如果已停止，则不继续执行
            if (button.textContent === '执行') {
                return;
            }
            
            // 获取剩余次数
            try {
                // 获取铜币次数元素
                const freeTimesElement = document.getElementById('get_free');
                const maxFreeTimesElement = document.getElementById('max_get_free');
                
                if (!freeTimesElement || !maxFreeTimesElement) {
                    console.error('未找到铜币次数元素');
                    setTimeout(executeHorseTraining, 250);
                    return;
                }
                
                const usedFreeTimes = parseInt(freeTimesElement.textContent);
                const maxFreeTimesText = maxFreeTimesElement.textContent;
                // 从"150周"中提取数字部分
                const maxFreeTimesMatch = maxFreeTimesText.match(/(\d+)/);
                const maxFreeTimes = maxFreeTimesMatch ? parseInt(maxFreeTimesMatch[1]) : 0;
                
                const remainingFreeTimes = maxFreeTimes - usedFreeTimes;
                
                console.log(`战马饲料 - 剩余铜币次数: ${remainingFreeTimes}/${maxFreeTimes} (已使用: ${usedFreeTimes})`);
                
                // 如果次数已用完，停止执行
                if (remainingFreeTimes <= 0) {
                    alert('战马饲料 - 铜币次数已用完，停止执行');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 执行铜币抽取操作
                const rand = Date.now();
                // 使用unsafeWindow访问页面中的loader对象
                const loader = unsafeWindow.loader;
                if (loader) {
                    loader.get(`/modules/horsees.php?act=get&type=1&rand=${rand}`, null, null, null, 'horse_call_back');
                } else {
                    console.error('未找到loader对象');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 等待一段时间后继续下一次抽取
                setTimeout(executeHorseTraining, 300);
            } catch (e) {
                console.error('战马饲料抽取执行失败:', e);
                setTimeout(executeHorseTraining, 300);
            }
        }
        
        // 开始执行厉兵秣马流程
        executeHorseTraining();
    }

    // 先天元神功能
    function meridianTraining() {
        const button = document.querySelector('button[data-action="meridianTraining"]');
        if (!button || button.textContent === '执行') {
            return;
        }
        
        // 检查是否在先天元神页面
        let isInMeridianPage = false;
        
        // 方法1：检查URL
        if (window.location.href.includes('meridians.php')) {
            isInMeridianPage = true;
        }
        
        // 方法2：检查菜单高亮
        if (!isInMeridianPage) {
            const menuLinks = document.querySelectorAll('#main_menu a');
            for (const link of menuLinks) {
                if (link.textContent.includes('先天元神') && link.classList.contains('highlight')) {
                    isInMeridianPage = true;
                    break;
                }
            }
        }
        
        // 方法3：检查页面元素
        if (!isInMeridianPage) {
            // 尝试查找先天元神相关元素
            if (document.getElementById('get_times') && document.getElementById('max_get_times')) {
                isInMeridianPage = true;
            }
        }
        
        if (!isInMeridianPage) {
            alert('请先进入先天元神页面！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 执行先天元神流程
        function executeMeridianTraining() {
            // 如果已停止，则不继续执行
            if (button.textContent === '执行') {
                return;
            }
            
            // 获取剩余次数
            try {
                // 获取次数元素
                const timesElement = document.getElementById('get_times');
                const maxTimesElement = document.getElementById('max_get_times');
                
                if (!timesElement || !maxTimesElement) {
                    console.error('未找到次数元素');
                    setTimeout(executeMeridianTraining, 250);
                    return;
                }
                
                const usedTimes = parseInt(timesElement.textContent);
                const maxTimes = parseInt(maxTimesElement.textContent);
                const remainingTimes = maxTimes - usedTimes;
                
                console.log(`先天元神 - 剩余次数: ${remainingTimes}/${maxTimes} (已使用: ${usedTimes})`);
                
                // 如果次数已用完，停止执行
                if (remainingTimes <= 0) {
                    alert('先天元神 - 次数已用完，停止执行');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 执行抽取操作
                const rand = Date.now();
                // 使用unsafeWindow访问页面中的loader对象
                const loader = unsafeWindow.loader;
                if (loader) {
                    loader.get(`/modules/meridians.php?act=get&type=3&rand=${rand}`, null, null, null, 'meridian_call_back');
                } else {
                    console.error('未找到loader对象');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 等待一段时间后继续下一次抽取
                setTimeout(executeMeridianTraining, 300);
            } catch (e) {
                console.error('先天元神抽取执行失败:', e);
                setTimeout(executeMeridianTraining, 300);
            }
        }
        
        // 开始执行先天元神流程
        executeMeridianTraining();
    }

    // 冲锋陷阵功能
    function diagramTraining() {
        const button = document.querySelector('button[data-action="diagramTraining"]');
        if (!button || button.textContent === '执行') {
            return;
        }
        
        // 检查是否在冲锋陷阵页面
        let isInDiagramPage = false;
        
        // 方法1：检查URL
        if (window.location.href.includes('diagrams.php')) {
            isInDiagramPage = true;
        }
        
        // 方法2：检查菜单高亮
        if (!isInDiagramPage) {
            const menuLinks = document.querySelectorAll('#main_menu a');
            for (const link of menuLinks) {
                if (link.textContent.includes('冲锋陷阵') && link.classList.contains('highlight')) {
                    isInDiagramPage = true;
                    break;
                }
            }
        }
        
        // 方法3：检查页面元素
        if (!isInDiagramPage) {
            // 尝试查找冲锋陷阵相关元素
            if (document.getElementById('get_times') && document.getElementById('max_get_times')) {
                isInDiagramPage = true;
            }
        }
        
        if (!isInDiagramPage) {
            alert('请先进入冲锋陷阵页面！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 执行冲锋陷阵流程
        function executeDiagramTraining() {
            // 如果已停止，则不继续执行
            if (button.textContent === '执行') {
                return;
            }
            
            // 获取剩余次数
            try {
                // 获取次数元素
                const timesElement = document.getElementById('get_times');
                const maxTimesElement = document.getElementById('max_get_times');
                
                if (!timesElement || !maxTimesElement) {
                    console.error('未找到次数元素');
                    setTimeout(executeDiagramTraining, 250);
                    return;
                }
                
                const usedTimes = parseInt(timesElement.textContent);
                const maxTimes = parseInt(maxTimesElement.textContent);
                const remainingTimes = maxTimes - usedTimes;
                
                console.log(`冲锋陷阵 - 剩余次数: ${remainingTimes}/${maxTimes} (已使用: ${usedTimes})`);
                
                // 如果次数已用完，停止执行
                if (remainingTimes <= 0) {
                    alert('冲锋陷阵 - 次数已用完，停止执行');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 执行抽取操作
                const rand = Date.now();
                // 使用unsafeWindow访问页面中的loader对象
                const loader = unsafeWindow.loader;
                if (loader) {
                    loader.get(`/modules/diagrams.php?act=get&type=3&rand=${rand}`, null, null, null, 'diagram_call_back');
                } else {
                    console.error('未找到loader对象');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 等待一段时间后继续下一次抽取
                setTimeout(executeDiagramTraining, 100);
            } catch (e) {
                console.error('冲锋陷阵抽取执行失败:', e);
                setTimeout(executeDiagramTraining, 100);
            }
        }
        
        // 开始执行冲锋陷阵流程
        executeDiagramTraining();
    }

    // 星辰抽取功能
    function totemExtract() {
        const button = document.querySelector('button[data-action="totemExtract"]');
        if (!button || button.textContent === '执行') {
            return;
        }
        
        // 检查是否在星辰页面
        let isInTotemPage = false;
        
        // 方法1：检查URL
        if (window.location.href.includes('totem.php')) {
            isInTotemPage = true;
        }
        
        // 方法2：检查菜单高亮
        if (!isInTotemPage) {
            const menuLinks = document.querySelectorAll('#main_menu a');
            for (const link of menuLinks) {
                if (link.textContent.includes('星辰合成') && link.classList.contains('highlight')) {
                    isInTotemPage = true;
                    break;
                }
            }
        }
        
        if (!isInTotemPage) {
            alert('请先进入星辰合成页面！');
            button.textContent = '执行';
            button.dataset.running = 'false';
            return;
        }

        // 执行星辰抽取流程
        let extractCount = 0; // 记录抽取次数，每10次整理一次
        
        function executeTotemExtract() {
            // 如果已停止，则不继续执行
            if (button.textContent === '执行') {
                return;
            }
            
            try {
                // 使用unsafeWindow访问页面中的loader对象和其他全局变量
                const loader = unsafeWindow.loader;
                const gAlertDialogOpen = unsafeWindow.gAlertDialogOpen;
                const process = unsafeWindow.process;
                const dialog = unsafeWindow.dialog;
                
                if (!loader) {
                    console.error('未找到loader对象');
                    button.textContent = '执行';
                    button.dataset.running = 'false';
                    return;
                }
                
                // 检查是否需要整理
                if (extractCount >= 10) {
                    console.log('星辰抽取 - 执行整理操作');
                    
                    // 执行整理操作
                    unsafeWindow.gAlertDialogOpen = false;
                    if (process && process.start) {
                        process.start();
                    }
                    loader.get('/modules/totem.php?act=blend&op=clean', null, null, null, 'callbackRoleTotemStudy');
                    if (dialog && dialog.close) {
                        dialog.close(this);
                    }
                    
                    // 重置计数器
                    extractCount = 0;
                    
                    // 等待整理完成后继续抽取
                    setTimeout(executeTotemExtract, 200);
                    return;
                }
                
                // 执行抽取操作
                console.log(`星辰抽取 - 执行第 ${extractCount + 1} 次抽取`);
                unsafeWindow.gAlertDialogOpen = false;
                loader.get('./modules/totem.php?act=blend&op=get&submit=1&type=money&rand=' + new Date().getTime(), null, null, null, 'callbackRoleTotemStudy');
                if (dialog && dialog.close) {
                    dialog.close(this);
                }
                
                // 增加计数器
                extractCount++;
                
                // 等待一段时间后继续下一次抽取
                setTimeout(executeTotemExtract, 100);
            } catch (e) {
                console.error('星辰抽取执行失败:', e);
                setTimeout(executeTotemExtract, 100);
            }
        }
        
        // 开始执行星辰抽取流程
        executeTotemExtract();
    }
})();
