// ==UserScript==
// @name         blivemedal
// @namespace    https://github.com/yokinanya/blivemedal
// @downloadURL  https://gcore.jsdelivr.net/gh/yokinanya/blivemedal@master/blivemedal.user.js
// @updateURL    https://gcore.jsdelivr.net/gh/yokinanya/blivemedal@master/blivemedal.user.js
// @version      1.2.0
// @description  拯救B站直播换牌子的用户体验
// @author       yokinanya
// @match        *://live.bilibili.com/*
// @require      https://s4.zstatic.net/ajax/libs/vue/2.6.14/vue.js
// @require      https://s4.zstatic.net/ajax/libs/vuex/3.6.2/vuex.js
// @require      https://s4.zstatic.net/ajax/libs/axios/0.26.0/axios.js
// @require      https://s4.zstatic.net/ajax/libs/element-ui/2.15.7/index.js
// @resource     element-ui-css https://s4.zstatic.net/ajax/libs/element-ui/2.15.7/theme-chalk/index.css
// @grant        GM_getResourceText
// @license      MIT
// ==/UserScript==

// grant不能是none，为了和网页的全局变量隔离。直播间网页全局变量有Vue，会导致element-ui出错

(function () {
    async function main() {
        initLib()
        initCss()
        await waitForLoaded()
        initUi()
    }

    function initLib() {
        let css = GM_getResourceText('element-ui-css')
        // 不是通过URL引用的，要修复相对URL
        css = css.replace(/url\(fonts\//g, 'url(https://s4.zstatic.net/ajax/libs/element-ui/2.15.7/theme-chalk/fonts/')
        let styleElement = unsafeWindow.document.createElement('style')
        styleElement.innerText = css
        unsafeWindow.document.head.appendChild(styleElement)
    }

    function initCss() {
        let css = `
      /* 屏蔽原来的牌子按钮 */
      .medal-section {
        display: none !important;
      }

      .blivemedal-entry {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 24px;
        margin-left: 8px;
        vertical-align: middle;
      }

      .blivemedal-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
        max-width: 76px;
        height: 22px;
        padding: 0 9px;
        border: 1px solid rgba(35, 173, 229, 0.22);
        border-radius: 11px;
        background: rgba(35, 173, 229, 0.08);
        color: #23ade5;
        font-family: inherit;
        font-size: 12px;
        line-height: 20px;
        font-weight: 400;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        outline: none;
      }

      .blivemedal-button:hover,
      .blivemedal-button:focus {
        border-color: rgba(35, 173, 229, 0.38);
        background: rgba(35, 173, 229, 0.14);
        color: #23ade5;
      }

      /* 屏蔽选牌子对话框，防止刷新时闪烁 */
      .dialog-ctnr.medal {
        display: none !important;
      }

      .blivemedal-dialog .el-dialog__header {
        padding: 20px 24px 10px;
      }

      .blivemedal-dialog .el-dialog__body {
        padding: 8px 24px 0;
      }

      .blivemedal-dialog .el-dialog__footer {
        padding: 12px 24px 18px;
      }

      .blivemedal-toolbar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .blivemedal-toolbar .el-input {
        width: 180px;
      }

      .blivemedal-toolbar .el-input__inner {
        height: 32px;
        line-height: 32px;
        border-radius: 4px;
      }

      .blivemedal-tool-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 0 14px;
        border: 1px solid rgba(35, 173, 229, 0.22);
        border-radius: 4px;
        background: rgba(35, 173, 229, 0.06);
        color: #23ade5;
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
      }

      .blivemedal-tool-button:hover {
        border-color: rgba(35, 173, 229, 0.38);
        background: rgba(35, 173, 229, 0.12);
        color: #23ade5;
      }

      .blivemedal-tool-button::before {
        content: '↻';
        margin-right: 6px;
        font-size: 13px;
      }

      .blivemedal-medal-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 52px;
        max-width: 86px;
        height: 24px;
        padding: 0 10px;
        border: 1px solid rgba(35, 173, 229, 0.28);
        border-radius: 5px;
        background: rgba(35, 173, 229, 0.12);
        color: #23ade5;
        font-size: 12px;
        line-height: 22px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .blivemedal-medal-tag.is-off {
        border-color: rgba(0, 0, 0, 0.08);
        background: rgba(0, 0, 0, 0.04);
        color: rgba(0, 0, 0, 0.48);
      }

      .blivemedal-action-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 56px;
        height: 28px;
        padding: 0 12px;
        border: 0;
        border-radius: 4px;
        background: #23ade5;
        color: #ffffff;
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
      }

      .blivemedal-action-button:hover {
        background: #39b9ec;
      }

      .blivemedal-action-button.is-muted {
        background: rgba(0, 0, 0, 0.36);
      }

      .blivemedal-action-button.is-muted:hover {
        background: rgba(0, 0, 0, 0.46);
      }

      .blivemedal-dialog .el-table {
        border-radius: 4px;
      }

      .blivemedal-dialog .el-table th {
        height: 40px;
        padding: 0;
      }

      .blivemedal-dialog .el-table td {
        height: 54px;
        padding: 0;
      }

      .blivemedal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-height: 36px;
      }

      .blivemedal-auto-default {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-left: 16px;
      }

      .blivemedal-auto-default .el-select {
        width: 220px;
      }

      /* 修复按钮文字不居中 */
      .blivemedal-dialog .el-button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }

      /* 深色模式 - 适配 Bilibili-Evolved */
      html.dark .blivemedal-dialog,
      body.dark .blivemedal-dialog {
        background-color: var(--Ga1_s, #232527) !important;
      }
      html.dark .blivemedal-dialog .el-dialog__header,
      body.dark .blivemedal-dialog .el-dialog__header {
        background-color: var(--Ga1_s, #232527) !important;
      }
      html.dark .blivemedal-dialog .el-dialog__title,
      body.dark .blivemedal-dialog .el-dialog__title {
        color: var(--Ga10, #e7e9eb) !important;
      }
      html.dark .blivemedal-dialog .el-table,
      body.dark .blivemedal-dialog .el-table,
      html.dark .blivemedal-dialog .el-table__expanded-cell,
      body.dark .blivemedal-dialog .el-table__expanded-cell,
      html.dark .blivemedal-dialog .el-table th,
      body.dark .blivemedal-dialog .el-table th,
      html.dark .blivemedal-dialog .el-table tr,
      body.dark .blivemedal-dialog .el-table tr {
        background-color: var(--Ga1_s, #232527) !important;
        color: var(--Ga10, #e7e9eb) !important;
        border-bottom-color: var(--Ga3, #46494d) !important;
      }
      html.dark .blivemedal-dialog .el-table td,
      body.dark .blivemedal-dialog .el-table td {
        background-color: var(--Ga1_s, #232527) !important;
        color: var(--Ga10, #e7e9eb) !important;
        border-bottom: 1px solid var(--Ga3, #46494d) !important;
      }
      html.dark .blivemedal-dialog .el-table--striped .el-table__body tr.el-table__row--striped td,
      body.dark .blivemedal-dialog .el-table--striped .el-table__body tr.el-table__row--striped td {
        background-color: var(--Ga2, #2f3134) !important;
      }
      html.dark .blivemedal-dialog .el-table--enable-row-hover .el-table__body tr:hover>td,
      body.dark .blivemedal-dialog .el-table--enable-row-hover .el-table__body tr:hover>td {
        background-color: var(--Ga3, #46494d) !important;
      }
      html.dark .blivemedal-dialog .el-table::before,
      body.dark .blivemedal-dialog .el-table::before {
        background-color: var(--Ga3, #46494d) !important;
      }
      html.dark .blivemedal-dialog .el-input__inner,
      body.dark .blivemedal-dialog .el-input__inner {
        background-color: var(--Ga2, #2f3134) !important;
        border-color: var(--Ga3, #46494d) !important;
        color: var(--Ga10, #e7e9eb) !important;
      }
      html.dark .blivemedal-dialog .el-checkbox,
      body.dark .blivemedal-dialog .el-checkbox {
        color: var(--Ga10, #e7e9eb) !important;
      }
      html.dark .blivemedal-dialog .el-dialog__headerbtn .el-dialog__close,
      body.dark .blivemedal-dialog .el-dialog__headerbtn .el-dialog__close {
        color: var(--Ga10, #e7e9eb) !important;
      }
      html.dark .blivemedal-dialog .el-dialog__headerbtn:hover .el-dialog__close,
      body.dark .blivemedal-dialog .el-dialog__headerbtn:hover .el-dialog__close {
        color: var(--theme-color, #409EFF) !important;
      }
      html.dark .blivemedal-dialog .el-link.el-link--primary,
      body.dark .blivemedal-dialog .el-link.el-link--primary {
        color: var(--theme-color, #409EFF) !important;
      }
      html.dark .blivemedal-dialog .el-link.el-link--primary:hover,
      body.dark .blivemedal-dialog .el-link.el-link--primary:hover {
        color: var(--theme-color-80, #66b1ff) !important;
      }

      html.dark .blivemedal-button,
      body.dark .blivemedal-button {
        border-color: rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.88);
      }
      html.dark .blivemedal-button:hover,
      html.dark .blivemedal-button:focus,
      body.dark .blivemedal-button:hover,
      body.dark .blivemedal-button:focus {
        border-color: rgba(255, 255, 255, 0.28);
        background: rgba(255, 255, 255, 0.18);
        color: #ffffff;
      }
      html.dark .blivemedal-tool-button,
      body.dark .blivemedal-tool-button {
        border-color: rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.82);
      }
      html.dark .blivemedal-tool-button:hover,
      body.dark .blivemedal-tool-button:hover {
        border-color: rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      html.dark .blivemedal-medal-tag.is-off,
      body.dark .blivemedal-medal-tag.is-off {
        border-color: rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.62);
      }
      html.dark .blivemedal-action-button.is-muted,
      body.dark .blivemedal-action-button.is-muted {
        background: rgba(255, 255, 255, 0.18);
      }
      html.dark .blivemedal-action-button.is-muted:hover,
      body.dark .blivemedal-action-button.is-muted:hover {
        background: rgba(255, 255, 255, 0.26);
      }

      /* 滚动条适配 */
      html.dark .blivemedal-dialog .el-table__body-wrapper::-webkit-scrollbar,
      body.dark .blivemedal-dialog .el-table__body-wrapper::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      html.dark .blivemedal-dialog .el-table__body-wrapper::-webkit-scrollbar-thumb,
      body.dark .blivemedal-dialog .el-table__body-wrapper::-webkit-scrollbar-thumb {
        background-color: var(--Ga3, #46494d);
        border-radius: 5px;
      }
      html.dark .blivemedal-dialog .el-table__body-wrapper::-webkit-scrollbar-track,
      body.dark .blivemedal-dialog .el-table__body-wrapper::-webkit-scrollbar-track {
        background-color: var(--Ga1_s, #232527);
      }
      html.dark .blivemedal-dialog .el-table__body-wrapper::-webkit-scrollbar-corner,
      body.dark .blivemedal-dialog .el-table__body-wrapper::-webkit-scrollbar-corner {
        background-color: var(--Ga1_s, #232527);
      }

      /* 下拉菜单深色模式 */
      html.dark .blivemedal-popper,
      body.dark .blivemedal-popper {
        background-color: var(--Ga1_s, #232527) !important;
        border-color: var(--Ga3, #46494d) !important;
      }
      html.dark .blivemedal-popper .el-select-dropdown__item,
      body.dark .blivemedal-popper .el-select-dropdown__item {
        color: var(--Ga10, #e7e9eb) !important;
      }
      html.dark .blivemedal-popper .el-select-dropdown__item.hover,
      html.dark .blivemedal-popper .el-select-dropdown__item:hover,
      body.dark .blivemedal-popper .el-select-dropdown__item.hover,
      body.dark .blivemedal-popper .el-select-dropdown__item:hover {
        background-color: var(--Ga3, #46494d) !important;
      }
      html.dark .blivemedal-popper .popper__arrow,
      body.dark .blivemedal-popper .popper__arrow {
        border-bottom-color: var(--Ga3, #46494d) !important;
      }
      html.dark .blivemedal-popper .popper__arrow::after,
      body.dark .blivemedal-popper .popper__arrow::after {
        border-bottom-color: var(--Ga1_s, #232527) !important;
      }

      /* 按钮深色模式 */
      html.dark .blivemedal-dialog .el-button--default,
      body.dark .blivemedal-dialog .el-button--default {
        background-color: var(--Ga2, #2f3134) !important;
        border-color: var(--Ga3, #46494d) !important;
        color: var(--Ga10, #e7e9eb) !important;
      }
      html.dark .blivemedal-dialog .el-button--default:hover,
      body.dark .blivemedal-dialog .el-button--default:hover {
        background-color: var(--Ga3, #46494d) !important;
        border-color: var(--theme-color, #409EFF) !important;
        color: var(--theme-color, #409EFF) !important;
      }
      html.dark .blivemedal-dialog .el-button--info,
      body.dark .blivemedal-dialog .el-button--info {
        background-color: var(--Ga5, #909399) !important;
        border-color: var(--Ga5, #909399) !important;
        color: #fff !important;
      }

      /* 标签深色模式 */
      html.dark .blivemedal-dialog .el-tag--info,
      body.dark .blivemedal-dialog .el-tag--info {
        background-color: var(--Ga2, #2f3134) !important;
        border-color: var(--Ga3, #46494d) !important;
        color: var(--Ga6, #909399) !important;
      }
    `
    let styleElement = unsafeWindow.document.createElement('style')
    styleElement.innerText = css
      unsafeWindow.document.head.appendChild(styleElement)
  }

    async function waitForLoaded(timeout = 10 * 1000) {
        return new Promise((resolve, reject) => {
            let startTime = new Date()
            function poll() {
                if (isLoaded()) {
                    resolve()
                    return
                }
                if (new Date() - startTime > timeout) {
                    reject(new Error(`[blivemedal] 等待加载超时，page=${unsafeWindow.location.href}`))
                    return
                }
                setTimeout(poll, 1000)
            }
            poll()
        })
    }

    function isLoaded() {
        if (getMedalButtonMountElement().element === null) {
            return false
        }
        return true
    }

    function loadConfig() {
        let config
        try {
            config = JSON.parse(unsafeWindow.localStorage.blivemedalConfig || '{}')
        } catch {
            config = {}
        }

        if (config.autoWearMedal === undefined) {
            config.autoWearMedal = false
        }
        if (config.autoWearDefaultMedal === undefined) {
            config.autoWearDefaultMedal = false
        }
        if (config.defaultMedalId === undefined) {
            config.defaultMedalId = ''
        }
        return config
    }

    function saveConfig(config) {
        unsafeWindow.localStorage.blivemedalConfig = JSON.stringify(config)
    }

    let store = new Vuex.Store({
        state: {
            config: loadConfig(),

            medals: [],
            curMedal: null
        },
        mutations: {
            setMedals(state, medals) {
                state.medals = medals
            },
            setCurMedal(state, curMedal) {
                state.curMedal = curMedal
            },
            setConfigItems(state, config) {
                for (let name in config) {
                    state.config[name] = config[name]
                }
                saveConfig(state.config)
            }
        },
        actions: {
            async updateMedals({ commit }) {
                commit('setMedals', getMedalsAsync())
            },
            async updateCurMedal({ commit }) {
                commit('setCurMedal', await getCurMedal())
            }
        }
    })

    function initUi() {
        let mount = getMedalButtonMountElement()
        let myMedalButtonElement = unsafeWindow.document.createElement('div')
        mount.element.insertBefore(myMedalButtonElement, mount.beforeElement)

        new Vue({
            el: myMedalButtonElement,
            store: store,
            components: {
                MedalDialog
            },
            template: `
        <div class="blivemedal-entry">
          <button class="blivemedal-button" type="button"
            @click="showMedalDialog"
          >
            {{ curMedal === null ? '勋章' : curMedal.medal_name }}
          </button>
          <medal-dialog ref="medalDialog"></medal-dialog>
        </div>
      `,
        computed: {
            ...Vuex.mapState({
                config: state => state.config,
                curMedal: state => state.curMedal
            })
        },
        async created() {
            await this.tryAutoWearMedal()
            this.updateCurMedal()
        },
        methods: {
            ...Vuex.mapActions([
                'updateCurMedal'
            ]),
            async tryAutoWearMedal() {
                if (!this.config.autoWearMedal) {
                    return
                }

                try {
                    let medalInfo = unsafeWindow.__NEPTUNE_IS_MY_WAIFU__.roomInfoRes.data.anchor_info.medal_info
                    if (medalInfo !== null) {
                        await wearMedal(medalInfo.medal_id)
                        return
                    }
                } catch {
                }

                try {
                    if (this.config.autoWearDefaultMedal && this.config.defaultMedalId !== '') {
                        await sleep(1000)
                        await wearMedal(this.config.defaultMedalId)
                    }
                } catch {
                }
            },
            showMedalDialog() {
                this.$refs.medalDialog.showDialog()
            }
        }
    })
  }

    function getMedalButtonMountElement() {
        let controlPanelElement = unsafeWindow.document.querySelector('#control-panel-ctnr-box')
        let medalSectionElement = unsafeWindow.document.querySelector('#control-panel-ctnr-box .medal-section')
        if (medalSectionElement !== null && medalSectionElement.parentElement !== null) {
            return {
                element: medalSectionElement.parentElement,
                beforeElement: medalSectionElement.nextElementSibling
            }
        }

        let toolbarElement = getDanmakuToolbarElement()
        if (toolbarElement !== null) {
            return {
                element: toolbarElement,
                beforeElement: getToolbarRightElement(toolbarElement)
            }
        }
        if (controlPanelElement !== null) {
            return {
                element: controlPanelElement,
                beforeElement: null
            }
        }
        return {
            element: null,
            beforeElement: null
        }
    }

    function getDanmakuToolbarElement() {
        let textareaElement = unsafeWindow.document.querySelector('textarea[placeholder*="发送"]')
        let sendButtonElement = [...unsafeWindow.document.querySelectorAll('button')]
            .find(element => element.textContent.trim() === '发送')
        if (textareaElement === null || sendButtonElement === undefined) {
            return null
        }

        let inputRowElement = getCommonAncestor(textareaElement, sendButtonElement)
        while (
            inputRowElement !== null
            && inputRowElement.previousElementSibling === null
            && inputRowElement.parentElement !== null
        ) {
            inputRowElement = inputRowElement.parentElement
        }
        return inputRowElement === null ? null : inputRowElement.previousElementSibling
    }

    function getCommonAncestor(aElement, bElement) {
        let ancestors = new Set()
        for (let element = aElement; element !== null; element = element.parentElement) {
            ancestors.add(element)
        }
        for (let element = bElement; element !== null; element = element.parentElement) {
            if (ancestors.has(element)) {
                return element
            }
        }
        return null
    }

    function getToolbarRightElement(toolbarElement) {
        for (let element of toolbarElement.children) {
            if (element.textContent.includes('粉丝特惠')) {
                return element
            }
        }
        return null
    }

    let MedalDialog = {
        name: 'MedalDialog',
        template: `
      <el-dialog :visible.sync="dialogVisible" title="我的粉丝勋章" top="8vh" width="900px" :modal="false" append-to-body custom-class="blivemedal-dialog">
        <div class="blivemedal-toolbar">
          <el-checkbox v-model="showLightedOnly">只显示已点亮</el-checkbox>
          <button class="blivemedal-tool-button" type="button" @click="refreshMedals">刷新勋章</button>
          <el-input size="medium" v-model="query" placeholder="搜索" clearable></el-input>
        </div>

        <el-table :data="medalsTableData" stripe height="60vh">
          <el-table-column label="勋章" prop="medal.medal_name" width="100" sortable
            :sort-method="(a, b) => a.medal.medal_name.localeCompare(b.medal.medal_name)"
          >
            <template slot-scope="scope">
              <span class="blivemedal-medal-tag" :class="{ 'is-off': !scope.row.medal.is_lighted }">{{ scope.row.medal.medal_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="等级" prop="medal.level" width="80" sortable></el-table-column>
          <el-table-column label="主播昵称" prop="anchor_info.nick_name" min-width="180" sortable
            :sort-method="(a, b) => a.anchor_info.nick_name.localeCompare(b.anchor_info.nick_name)"
          >
            <template slot-scope="scope">
              <el-link type="primary" :underline="false" target="_blank" :href="'https://live.bilibili.com/' + scope.row.room_info.room_id">
                {{ scope.row.anchor_info.nick_name }}
              </el-link>
              <el-badge v-if="scope.row.room_info.living_status" is-dot></el-badge>
            </template>
          </el-table-column>
          <el-table-column label="亲密度/原力值" prop="medal.intimacy" width="150" sortable>
            <template slot-scope="scope">
              {{ scope.row.medal.intimacy }} / {{ scope.row.medal.next_intimacy }}
            </template>
          </el-table-column>
          <el-table-column label="本日亲密度/原力值" prop="medal.today_feed" width="160" sortable>
            <template slot-scope="scope">
              {{ scope.row.medal.today_feed }} / {{ scope.row.medal.day_limit }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110">
            <template slot-scope="scope">
              <button v-if="curMedal !== null && scope.row.medal.medal_id === curMedal.medal_id"
                class="blivemedal-action-button is-muted" type="button" @click="takeOffMedal"
              >取消佩戴</button>
              <button v-else class="blivemedal-action-button" type="button" @click="wearMedal(scope.row)">佩戴</button>
            </template>
          </el-table-column>
        </el-table>
        <div slot="footer" class="blivemedal-footer">
          <el-checkbox label="进入直播间时自动佩戴勋章" :value="config.autoWearMedal"
            @change="value => setConfigItems({ autoWearMedal: value })"
          ></el-checkbox>
          <div v-show="config.autoWearMedal" class="blivemedal-auto-default">
            <el-checkbox label="没有对应勋章时佩戴" :value="config.autoWearDefaultMedal"
              @change="value => setConfigItems({ autoWearDefaultMedal: value })"
            ></el-checkbox>
            <el-select
              filterable :value="config.defaultMedalId" @change="value => setConfigItems({ defaultMedalId: value })"
              popper-class="blivemedal-popper"
            >
              <el-option v-for="item in sortedMedals" :key="item.medal.medal_id"
                :label="item.anchor_info.nick_name + ' / ' + item.medal.medal_name" :value="item.medal.medal_id"
              >
                <span>{{ item.anchor_info.nick_name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.medal.medal_name }}</span>
              </el-option>
            </el-select>
          </div>
        </div>
      </el-dialog>
    `,
      data() {
          return {
              dialogVisible: false,
              query: '',
              showLightedOnly: false
          }
      },
      computed: {
          ...Vuex.mapState({
              config: state => state.config,
              medals: state => state.medals,
              curMedal: state => state.curMedal
          }),
          medalsTableData() {
              let res = this.sortedMedals

              if (this.showLightedOnly) {
                  res = res.filter(item => item.medal.is_lighted)
              }

              if (this.query !== '') {
                  let query = this.query.toLowerCase()
                  res = res.filter(medal => 
                                   medal.medal.medal_name.toLowerCase().indexOf(query) !== -1
                                   || medal.anchor_info.nick_name.toLowerCase().indexOf(query) !== -1
                                  )
              }
              return res
          },
          sortedMedals() {
              let curRoomId
              try {
                  curRoomId = unsafeWindow.BilibiliLive.ROOMID
              } catch {
                  curRoomId = 0
              }

              let curMedal = []
              let curRoomMedal = []
              let medals = []
              for (let medal of this.medals) {
                  if (this.curMedal !== null && medal.medal.medal_id === this.curMedal.medal_id) {
                      curMedal.push(medal)
                  } else if (medal.room_info.room_id === curRoomId) {
                      curRoomMedal.push(medal)
                  } else {
                      medals.push(medal)
                  }
              }

              // 不是当前牌子或当前房间牌子的按 (等级降序, 亲密度降序, 牌子ID升序) 排序
              medals.sort((a, b) => {
                  let aKey = [-a.medal.level, -a.medal.intimacy, a.medal.medal_id]
                  let bKey = [-b.medal.level, -b.medal.intimacy, b.medal.medal_id]
                  for (let i = 0; i < aKey.length; i++) {
                      let diff = aKey[i] - bKey[i]
                      if (diff !== 0) {
                          return diff
                      }
                  }
                  return 0
              })

              return [...curMedal, ...curRoomMedal, ...medals]
          }
      },
      methods: {
          ...Vuex.mapMutations([
              'setConfigItems'
          ]),
          ...Vuex.mapActions({
              doUpdateMedals: 'updateMedals',
              doUpdateCurMedal: 'updateCurMedal'
          }),
          showDialog() {
              // 只自动加载一次
              if (this.medals.length === 0) {
                  this.updateMedals()
              }
              this.updateCurMedal()
              this.dialogVisible = true
          },
          refreshMedals() {
              this.updateMedals()
              this.updateCurMedal()
              refreshBilibiliCurMedalCache()
          },
          async updateMedals() {
              try {
                  await this.doUpdateMedals()
              } catch (e) {
                  this.$message.error(e)
              }
          },
          async updateCurMedal() {
              try {
                  await this.doUpdateCurMedal()
              } catch (e) {
                  this.$message.error(e)
              }
          },
          async wearMedal(medal) {
              try {
                  await wearMedal(medal.medal.medal_id)
              } catch (e) {
                  this.$message.error(e)
                  return
              }
              this.updateCurMedal()
          },
          async takeOffMedal() {
              try {
                  await takeOffMedal()
              } catch (e) {
                  this.$message.error(e)
                  return
              }
              this.updateCurMedal()
          }
      }
  }

  let apiClient = axios.create({
      baseURL: 'https://api.live.bilibili.com',
      withCredentials: true
  })

  function getMedalsAsync() {
      let res = []
      let addedMedalIds = new Set()

      async function doGetMedalsAsync() {
          // 获取第一页和总页数
          let rsp
          try {
              rsp = await getPage(1)
          } catch (e) {
              console.error('获取勋章列表第 1 页失败：', e)
              return
          }
          pushResFromRsp(rsp)

          // 并发获取剩下的页
          if (rsp.page_info.total_page <= 1) {
              return
          }
          let pageQueue = []
          for (let page = 2; page <= rsp.page_info.total_page; page++) {
              pageQueue.push(page)
          }
          const WORKER_NUM = 8
          let workerPromises = []
          for (let i = 0; i < WORKER_NUM; i++) {
              workerPromises.push(worker(pageQueue))
          }
          await Promise.all(workerPromises)
      }

      async function worker(pageQueue) {
          while (true) {
              let page = pageQueue.shift()
              if (page === undefined) {
                  break
              }

              let rsp
              try {
                  rsp = await getPage(page)
              } catch (e) {
                  console.error(`获取勋章列表第 ${page} 页失败：`, e)
                  continue
              }
              pushResFromRsp(rsp)
          }
      }

      function pushResFromRsp(rsp) {
          for (let medals of [rsp.special_list, rsp.list]) {
              for (let medal of medals) {
                  if (addedMedalIds.has(medal.medal.medal_id)) {
                      continue
                  }
                  addedMedalIds.add(medal.medal.medal_id)
                  res.push(medal)
              }
          }
      }

      async function getPage(page) {
          let rsp = (await apiClient.get('/xlive/app-ucenter/v1/fansMedal/panel', {
              params: {
                  page_size: 10, // 目前没有发现这个接口有尺寸限制，为了防止以后被背刺，还是一次请求10个
                  page: page
              }
          })).data
          if (rsp.code !== 0) {
              throw new Error(rsp.message)
          }
          return rsp.data
      }

      doGetMedalsAsync()
      return res
  }

    async function getCurMedal() {
        let csrfToken = getCsrfToken()
        let data = new FormData()
        data.append('source', 1)
        data.append('uid', unsafeWindow.BilibiliLive.UID)
        data.append('target_id', unsafeWindow.BilibiliLive.ANCHOR_UID)
        data.append('csrf_token', csrfToken)
        data.append('csrf', csrfToken)
        let rsp = (await apiClient.post('/live_user/v1/UserInfo/get_weared_medal', data)).data
        if (rsp.code !== 0) {
            throw new Error(rsp.message)
        }
        let curMedal = rsp.data
        if (curMedal.medal_id === undefined) {
            // 没佩戴牌子
            curMedal = null
        }
        return curMedal
    }

    async function wearMedal(medalId) {
        let csrfToken = getCsrfToken()
        let data = new FormData()
        data.append('medal_id', medalId)
        data.append('csrf_token', csrfToken)
        data.append('csrf', csrfToken)
        let rsp = (await apiClient.post('/xlive/web-room/v1/fansMedal/wear', data)).data
        if (rsp.code !== 0) {
            throw new Error(rsp.message)
        }
        refreshBilibiliCurMedalCache()
    }

    async function takeOffMedal() {
        let csrfToken = getCsrfToken()
        let data = new FormData()
        data.append('csrf_token', csrfToken)
        data.append('csrf', csrfToken)
        let rsp = (await apiClient.post('/xlive/web-room/v1/fansMedal/take_off', data)).data
        if (rsp.code !== 0) {
            throw new Error(rsp.message)
        }
        refreshBilibiliCurMedalCache()
    }

    function getCsrfToken() {
        let match = unsafeWindow.document.cookie.match(/\bbili_jct=(.+?)(?:;|$)/)
        if (match === null) {
            return ''
        }
        return match[1]
    }

    function refreshBilibiliCurMedalCache() {
        let originalMedalButton = unsafeWindow.document.querySelector('.medal-section .fans-medal-item')
        if (originalMedalButton === null) {
            return
        }
        originalMedalButton.click()
        setTimeout(() => originalMedalButton.click(), 0)
    }

    async function sleep(time) {
        return new Promise(resolve => window.setTimeout(resolve, time))
    }

    main()
})();
