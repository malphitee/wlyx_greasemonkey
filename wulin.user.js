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
        </div>
        <div class="module-group" data-module-group="wuhun" style="display:none;">
            <ul class="module-list">
                <li>抽取武魂黄金经验宝石 <button class="execute-button" data-action="extractWuhun">执行</button></li>
                <li>武魂宝石升级 <button class="execute-button" data-action="upgradeGem">执行</button></li>
                <li>武魂经验一键训练 <input type="number" class="train-times" value="0" min="0" max="100" style="width: 40px;"> <button class="execute-button" data-action="trainWuhun">执行</button></li>
            </ul>
            <button id="back-button">返回</button>
        </div>
    `;
    document.body.appendChild(floatingWindow);

    // 返回按钮点击事件
    document.querySelector('#back-button').addEventListener('click', function() {
        floatingWindow.querySelector('[data-module-group="wuhun"]').style.display = 'none';
        floatingWindow.querySelector('[data-module-group="main"]').style.display = 'block';
    });

    // 模块点击事件
    document.querySelectorAll('#myFloatingWindow .module-title').forEach(title => {
        title.addEventListener('click', function() {
            let module = this.dataset.module;
            floatingWindow.querySelector('[data-module-group="main"]').style.display = 'none';
            floatingWindow.querySelector('[data-module-group="'+ module +'"]').style.display = 'block';
        });
    });

    // 执行按钮点击事件
    document.querySelectorAll('#myFloatingWindow .execute-button').forEach(button => {
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
                        const trainTimesInput = document.querySelector('.train-times');
                        const trainTimes = parseInt(trainTimesInput.value) || 0;
                        trainWuhun(this, trainTimes);
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

        console.log(`剩余免费次数: ${freeTimesLeft}, 总剩余次数: ${totalTimesLeft}`);

        // 如果没有剩余次数，提示用户
        if (totalTimesLeft <= 0) {
            alert('今日已无剩余抽取次数！');
            return;
        }

        // 点击黄金经验按钮
        console.log('点击黄金经验按钮');
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
            
            console.log('找到的确认按钮:', confirmButton);
            
            if (confirmButton) {
                console.log('找到确认按钮，自动点击');
                confirmButton.click();
                
                // 等待抽取结果显示并处理下一次抽取
                setTimeout(() => {
                    // 检查是否有新的确认按钮出现（例如结果提示框）
                    let resultConfirmButton = document.querySelector('input[value="确定"]');
                    if (resultConfirmButton) {
                        console.log('找到结果确认按钮，自动点击');
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
                        
                        console.log(`更新后剩余免费次数: ${updatedFreeTimesLeft}, 总剩余次数: ${updatedTotalTimesLeft}`);
                        
                        // 如果还有免费次数，自动继续抽取
                        if (updatedFreeTimesLeft > 0) {
                            console.log('还有免费次数，自动继续抽取');
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
                            
                            console.log(`当前宝石经验: ${gemExp}`);
                            
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
})();
