
export type WindowState = { id:string; appId:string; title:string; x:number; y:number; w:number; h:number; z:number; minimized:boolean; maximized:boolean; appState?:any };
export type OSProfile = {
  id:string; theme:'neo';
  windows:Record<string,WindowState>;
  dock:string[];
  desktop:{appId:string;x:number;y:number}[];
  appData:Record<string,Record<string,any>>;
  lastSession:{openApps:string[]; ts:number};
};
export type FileEntry = { path:string; kind:'file'|'dir'; mime?:string; size?:number; mtime:number };
