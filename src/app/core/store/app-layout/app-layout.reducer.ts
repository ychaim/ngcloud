import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { AppLayoutActions } from './app-layout.actions';

export interface IAppVersion {
  semver: string;
  isNewAvailable: boolean;
  checkingForVersion: boolean;
}
export interface ISkins {
  theme: number;
  boxed: boolean;
  dir: string;
}
export interface IAppSettings {
  sidebarExpanded: boolean;
  chatbarExpanded: boolean;
  requestInProcess: boolean;
  version: IAppVersion;
  skins: ISkins;
}
const initialState: IAppSettings = {
  sidebarExpanded: true,
  chatbarExpanded: false,
  requestInProcess: false,
  skins: {
    theme: 1,
    boxed: false,
    dir: 'ltr',
  },
  version: {
    semver: '',
    isNewAvailable: false,
    checkingForVersion: false
  }
};
export function appLayout(state: IAppSettings = initialState, action: Action): IAppSettings {
  switch (action.type) {
    case AppLayoutActions.SIDEBAR_EXPAND:
      return Object.assign({}, state, { sidebarExpanded: true });

    case AppLayoutActions.SIDEBAR_COLLAPSE:
      return Object.assign({}, state, { sidebarExpanded: false });

    case AppLayoutActions.SIDEBAR_TOGGLE:
      return Object.assign({}, state, { sidebarExpanded: !state.sidebarExpanded });

    // chatbar side bar
    case AppLayoutActions.CHATBAR_EXPAND:
      return Object.assign({}, state, { chatbarExpanded: true });

    case AppLayoutActions.CHATBAR_COLLAPSE:
      return Object.assign({}, state, { chatbarExpanded: false });

    case AppLayoutActions.CHATBAR_TOGGLE:
      return Object.assign({}, state, { chatbarExpanded: !state.chatbarExpanded });
    // end chatbar side bar

    case AppLayoutActions.APP_VERSION_RECIEVED: {
      const version = getVersion(state, action.payload);
      return Object.assign({}, state, { version });
    }

    case AppLayoutActions.APP_CHECK_VERSION: {
      const version = Object.assign({}, state.version, {
        checkingForVersion: true
      });
      return Object.assign({}, state, { version });
    }

    case AppLayoutActions.THEME_SKIN: {
      if (state.skins.theme !== action.payload) {
        const skins = Object.assign({}, state.skins, {
          theme: action.payload
        });
        return Object.assign({}, state, { skins });
      }
      return state;
    }
    case AppLayoutActions.THEME_LAYOUT_TOGGLE: {
      const skins = Object.assign({}, state.skins, {
        boxed: !state.skins.boxed
      });
      return Object.assign({}, state, { skins });
    }
    case AppLayoutActions.THEME_LAYOUT_EXPAND: {
      const skins = Object.assign({}, state.skins, {
        boxed: false
      });
      return Object.assign({}, state, { skins });
    }
    case AppLayoutActions.THEME_DIR: {
      const skins = Object.assign({}, state.skins, {
        dir: state.skins.dir === 'ltr'? 'rtl':'ltr'
      });
      return Object.assign({}, state, { skins });
    }

    default:
      return Object.assign({}, initialState, state);
  }
};

export const appLayoutRegister = {
  reducer: { appLayout },
  actions: AppLayoutActions
};

function getVersion(state: IAppSettings, packageJson: any): IAppVersion {
  const currentVersion = state.version.semver;
  const remoteVersion = packageJson.version;
  const version: IAppVersion = {
    semver: '',
    isNewAvailable: state.version.isNewAvailable,
    checkingForVersion: false
  };
  const isCurrentVersionEmpty = '' === currentVersion;
  const isCurrentDifferentFromRemote = !isCurrentVersionEmpty && currentVersion !== remoteVersion;
  if (isCurrentVersionEmpty) {
    version.semver = remoteVersion;
  }
  if (isCurrentDifferentFromRemote && !version.isNewAvailable) {
    version.semver = currentVersion;
    version.isNewAvailable = true;
  } else {
    // upgrade is completed
    version.semver = remoteVersion;
    version.isNewAvailable = false;
  }
  return version;
};
