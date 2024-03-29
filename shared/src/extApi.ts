import {BackupData, FileData, ResourceInfo, WebPage} from "./@types/data";
import {Find, Pagination, Query} from "./@types/database";
import {BaseMessageResponse, IBaseMessageListener, IExtenstionMessageListener} from "./communication/base";
import {AxiosRequestConfig, AxiosResponse} from "axios";
import {Action, ACTION_TYPES} from "./pagenote-actions/@types";
import {ConvertMethod, getDefaultConvertMethod} from "./pagenote-convert";
import {Brush, getDefaultBrush, LightStatus, LightType} from "./pagenote-brush";
import {createInitAction} from "./pagenote-actions";

type ComputeRequestToBackground<Funs extends Record<string, IBaseMessageListener<any, any, any>>> = {
    [fun in keyof Funs] : {
        (arg:Parameters<Funs[fun]>[0]):Promise<Parameters<Parameters<Funs[fun]>[2]>[0]>
    }
}

type ComputeRequestToFront<Funs extends Record<string, IBaseMessageListener<any, any, any>>> = {
    [fun in keyof Funs] : {
        (arg:Parameters<Funs[fun]>[0],tabId?:number):Promise<Parameters<Parameters<Funs[fun]>[2]>[0]>
    }
}

type ResponseType<T> = T extends BaseMessageResponse<infer R> ? R : T
type ComputeServerResponse<Funs extends Record<string, IRequest<any,any>>> = {
    [fun in keyof Funs]:IExtenstionMessageListener<Parameters<Funs[fun]>[0], ResponseType<ReturnType<Funs[fun]>>>
}

interface IRequest<PARAMS, RESPONSE> {
    (params:PARAMS):BaseMessageResponse<RESPONSE>
}

export namespace boxroom {
    export const id = 'boxroom'
    export type BoxItem = {
        id?: string, // 资源ID，非指定情况下md5值
        boxType?: string, // 资源类型
        data?: {
            text: string,
            type?: any,
        }, // 数据
        from?: string, // 来源
        createAt?: number, // 来源
        expiredAt?: number,
    }

    // 索引
    export type BoxKeys ={
        id: string,
        createAt: number,
        createAtDay: string,
        from: string,
        boxType: string
    }

    export type response = {
        get: IExtenstionMessageListener<Find<BoxKeys>,BoxItem[]>,
        save: IExtenstionMessageListener<Partial<BoxItem>,BoxItem>,
        update: IExtenstionMessageListener<Partial<BoxItem>, BoxItem>
        remove: IExtenstionMessageListener<Partial<boxroom.BoxItem>, void>,
        [key: string]: IExtenstionMessageListener<any, any>
    }

    export type request = ComputeRequestToBackground<response>
}

export namespace lightpage{
    export const id = 'lightpage';

    // 索引字段
    export type WebPageKeys = {
        key: string,
        deleted: boolean,
        domain: string,
        icon: string,
        path: string,
        text: string,
        tip: string,
        context: string,
        title: string,
        categories: string[],
        category: string,
        createAt: number,
        updateAt: number,
        expiredAt: number,
        updateAtDay: string,
        createAtDay: string,
        basename: string,
        lastmod: string,
        etag: string,
        lightCnt: number, // 高亮个数
        colors: string[],
        score: number,
        thumb: string,
    }


    // 服务端可接受的请求API
    export type response = {
        saveLightPage: IExtenstionMessageListener<Partial<WebPage>, WebPage|null>,
        removeLightPage: IExtenstionMessageListener<{key:string}, number>,
        removeLightPages: IExtenstionMessageListener<string[], number>
        /**查询列表pages*/
        getLightPages: IExtenstionMessageListener<Find<WebPageKeys>, {pages:WebPage[]|WebPageKeys[],pagination:Pagination}>,
        getLightPageDetail: IExtenstionMessageListener<Query<WebPageKeys>, WebPage | null>,
        groupPages: IExtenstionMessageListener<{groupBy: keyof WebPageKeys, query?: Query<WebPageKeys> }, any>,
        // 导出pages
        exportPages: IExtenstionMessageListener<boolean, BackupData>
        // 导入pages，只能插件内使用，数量太大，可能通讯失败
        importPages: IExtenstionMessageListener<BackupData, number>,
        [key: string]: IExtenstionMessageListener<any, any>
    }

    export type request = ComputeRequestToBackground<response>
}

export namespace setting{
    export const id = 'setting';

    export enum SDK_VERSION {
        ts_format='1'
    }

    // 插件内部的配置项，不在各端同步
    type Inner_Setting ={
        _libra?: boolean, // 是否开启实验功能
        _sync?: boolean, // 是否在各端之间同步设置
    }

    export type SDK_SETTING = Inner_Setting & {
        lastModified: number,
        brushes: Brush[],
        copyAllowList: string[],
        commonSetting: {
            maxRecord: number,
            showBarTimeout: number,
            keyupTimeout: number,
            removeAfterDays: number,
        },
        actions: Action[],
        disableList: string[],
        controlC: boolean,
        autoBackup: number, // 自动备份周期
        enableMarkImg: boolean,
        convertMethods: ConvertMethod[],
        dataVersion: SDK_VERSION,
        extVersion: string,
        sdkVersion: string,
        useRecommend: boolean
    }

    export interface response{
        // 获取用户可用配置
        getUserSetting: IExtenstionMessageListener<void, SDK_SETTING>
        // // 同步云端设置
        // syncSetting: IExtenstionMessageListener<void, SDK_SETTING>
        // 本地设置存储
        getSetting: IExtenstionMessageListener<void, SDK_SETTING>
        saveSetting: IExtenstionMessageListener<Partial<SDK_SETTING>, SDK_SETTING>
        resetSetting: IExtenstionMessageListener<void,SDK_SETTING>
        [key: string]: IExtenstionMessageListener<any, any>
    }

    export type request = ComputeRequestToBackground<response>

    export function getDefaultSdkSetting(originSetting:Partial<SDK_SETTING>={}):SDK_SETTING {
        const defaultBrushes = [
            getDefaultBrush({
                bg: '#FFFF83',
            }),
            getDefaultBrush({
                bg: '#A6FFE9',
                label: '删除线',
                lightType: LightType.deleteLine,
                defaultStatus: LightStatus.un_light
            }),
            getDefaultBrush({
                bg: '#FFC7BA',
                defaultStatus: LightStatus.full_light
            }),
            getDefaultBrush({
                bg: '#B8EEFF',
                defaultStatus: LightStatus.half_light
            }),
            getDefaultBrush({
                bg: '#FFD0EF',
                defaultStatus: LightStatus.half_light
            }),
            getDefaultBrush({
                bg: '#D9C3FF',
                defaultStatus: LightStatus.half_light
            }),
            getDefaultBrush({
                bg: '#a64db4',
                defaultStatus: LightStatus.half_light
            }),
            getDefaultBrush({
                bg: '#195772',
                defaultStatus: LightStatus.half_light
            }),
            getDefaultBrush({
                bg: '#4467a8',
                defaultStatus: LightStatus.half_light
            }),
        ]
        const setting : SDK_SETTING = {
            // _libra: false,
            // _sync: false,
            actions: [createInitAction(ACTION_TYPES.search),createInitAction(ACTION_TYPES.copyToClipboard),createInitAction(ACTION_TYPES.send_to_email)],
            autoBackup: 3600 * 24 * 7,
            brushes: defaultBrushes,
            commonSetting: {
                keyupTimeout: 0,
                maxRecord: 999,
                removeAfterDays: 30,
                showBarTimeout: 0
            },
            controlC: true,
            copyAllowList: [],
            disableList: [],
            enableMarkImg: false,
            convertMethods: [getDefaultConvertMethod()],
            lastModified: 0,
            sdkVersion: "5.5.3",
            extVersion: '0.20.23',
            dataVersion: SDK_VERSION.ts_format,
            useRecommend: true
        }
        return {
            ...setting,
            ...originSetting
        }
    }
}

export namespace browserAction{
    export const id='browserAction'
    // 浏览器图标样式描述
    export enum ActionImageType {
        enable = 'images/light-32.png',
        disable = 'images/light-disable.png',
    }
    export type BadgeProps = {
        icon?: string,
        text?: string,
        color?: string,
        title?: string,
        popup?: string,
    }

    type ActionClickParams = { onclick: (tab:chrome.tabs.Tab)=>void,tabId?: number }
    type DisplayParams = {info:Partial<BadgeProps>,tabId?: number}

    export type response = {
        setBrowserActionDisplay: IExtenstionMessageListener<DisplayParams,BadgeProps>
        setBrowserActionClick: IExtenstionMessageListener<ActionClickParams, BadgeProps|undefined>
        getBrowserActionInfo: IExtenstionMessageListener<{ tabId?: number }, BadgeProps>
        [key: string]: IExtenstionMessageListener<any, any>
    }
    export type request = ComputeRequestToBackground<response>
}

export namespace action {
    import CaptureVisibleTabOptions = chrome.tabs.CaptureVisibleTabOptions;
    export const id = 'action'
    export interface injectParams {
        tabId?: number
        scripts: string[],
        css: string[],
        allFrames: boolean,
    }

    export interface ClipboardItem {
        text: string,
    }

    export type response = {
        injectCodeToPage: IExtenstionMessageListener<injectParams, boolean>
        track: IExtenstionMessageListener<[category:string,eventAction:string,eventLabel:string,eventValue:number,page?:string], void>
        report: IExtenstionMessageListener<{ errorInfo: any }, void>
        axios: IExtenstionMessageListener<AxiosRequestConfig, AxiosResponse | null>
        captureView: IExtenstionMessageListener<CaptureVisibleTabOptions, string>
        copyToClipboard: IExtenstionMessageListener<ClipboardItem, ClipboardItem>
        injectToFrontPage: IExtenstionMessageListener<{url:string,isIframe:boolean}, string>
        usage: IExtenstionMessageListener<void, { storageSize: number }>
        getMemoryRuntime: IExtenstionMessageListener<string, any>
        setMemoryRuntime: IExtenstionMessageListener<Record<string, any>, any>
        [key: string]: IExtenstionMessageListener<any, any>
    }

    export type request = ComputeRequestToBackground<response>
}

export namespace user{
    export const id = 'user'
    export type WhoAmI = {
        origin: string,
        extensionId: string,
        name: string,
        version: string,
        mainVersion: string,// 主要版本
        short_name: string,
        browser: string,
        browserVersion: string,
        browserPlatform: string,
        platform: string,
        language: string,
        isCN: boolean,
        isMac: boolean,
        isTest: boolean,
        uuid: string, // UUID 可以开放接口由用户自行修改
        did: string, // 客户端的标识 did 不可变更
        supportSDK: string[],
    }

    interface User {
        profile: {
            pro: number,
            seed: number
        },
    }

    export interface response {
        getWhoAmI: IExtenstionMessageListener<void, WhoAmI>,
        getUser: IExtenstionMessageListener<void, User|undefined>,
        setUserToken: IExtenstionMessageListener<string, string>
        getUserToken: IExtenstionMessageListener<void, string>
        [key:string]: IExtenstionMessageListener<any, any>
    }

    export type request = ComputeRequestToBackground<response>
}

export namespace localdir{
    export const id = 'localdir'
    export interface response {
        readPagesFrontDir: IExtenstionMessageListener<any, number>
        requestPermission: IExtenstionMessageListener<void, string>

        [key:string]: IExtenstionMessageListener<any, any>
    }

    export type request = ComputeRequestToBackground<response>
}

export namespace fileDB{
    export const id = 'fileDB'
    export interface response {
        /**新建或更新*/
        saveFile: IExtenstionMessageListener<{info:ResourceInfo,upsert: boolean},ResourceInfo|undefined>
        /**查询资源*/
        getFile: IExtenstionMessageListener<Partial<ResourceInfo>,FileData>
        /**查询资源（不含文件数据）*/
        getFiles: IExtenstionMessageListener<Partial<ResourceInfo>,Omit<FileData, 'data'>[]>
        /**删除资源*/
        removeFiles: IExtenstionMessageListener<Partial<ResourceInfo>, { deleteCnt:number }>
        [key:string]: IExtenstionMessageListener<any, any>
    }
    export type request = ComputeRequestToBackground<response>
}


// 前端页面作为服务端的请求集合
export namespace frontApi{
    export const id = 'front-server'
    export type response = {
        onCaptureView: IExtenstionMessageListener<{ imageStr: string,isAuto?:boolean }, string>
        mark_image: IExtenstionMessageListener<chrome.contextMenus.OnClickData, string>
        record: IExtenstionMessageListener<chrome.contextMenus.OnClickData, number>
        injectOriginScripts: IExtenstionMessageListener<{ scripts:string[] }, string>
        toggleAllLight: IExtenstionMessageListener<void, boolean>
        togglePagenote: IExtenstionMessageListener<void, boolean>
        makeHTMLSnapshot: IExtenstionMessageListener<void, { html: string, key: string }>
        fetchStatus: IExtenstionMessageListener<void, { connected: boolean,active: boolean }>
        [key: string]: IExtenstionMessageListener<any, any>
    }

    export type request = ComputeRequestToFront<response>
}
