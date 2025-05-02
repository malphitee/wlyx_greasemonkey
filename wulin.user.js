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
})();
