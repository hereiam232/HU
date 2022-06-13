enum AuthType {
    Digest = "digest",
    None = "none",
    Password = "password",
    Token = "token"
}

interface WebdavSetting {
    accountAuthType: AuthType,
    accountDirRoot: string,
    accountName: string,
    accountToken: string, // 对应 AuthType password/token
    accountServer: string,
    accountSecret?: string,
    accountSwitch?: boolean,
    accountRefreshToken?: string,
    accountEtr?: string // 额外 json 格式数据
}

enum FILE_ACTION {
    conflict=1,
    clientDownload=2,
    clientDelete=3,
    clientUpload= 4,
    serverDelete = 5,
    overrideUpload = 6, // 覆盖上传
    overrideDownload = 7, // 覆盖下载
}
enum TaskState {
    pending='pending',
    resolving='resolving',
    networkError='networkError',
    localDataError='localDataError',
    success='success',
    valid='valid', // 数据不合法
    decodeError='decodeError' // 解密失败
}
type TaskDetail = {
    basename: string,
    key?: string,
    state: TaskState,
    localEtag: string,
    localLastmod: string,
    // localUpdateAt: number,
    // cloudUpdateAt?: number,
    cloudEtag: string,
    cloudLastmod: string,
    actionType: FILE_ACTION,
}

type Tasks = {
    [key in FILE_ACTION]: Record<string, TaskDetail>
    // conflict: Record<string, TaskDetail>,
    // clientDownload: Record<string, TaskDetail>,
    // clientDelete: Record<string, TaskDetail>,
    // clientUpload: Record<string, TaskDetail>,
    // serverDelete: Record<string, TaskDetail>,
}

enum WebdavStatus {
    blocked=503, // 被禁用、可能频控限制了
    unAuth= 401, // 无权限
    TrafficRateExhausted = 403, // 流量不足了
    unknown=0,
    connected=1,
}

export type {
    Tasks,
    TaskDetail,
}

export {
    TaskState,
    WebdavStatus,
    FILE_ACTION,
}