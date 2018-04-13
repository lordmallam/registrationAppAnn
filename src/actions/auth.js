import PouchDB from 'pouchdb-react-native';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import Types from './types';
import Config from '../config';
import PouchOps from '../utils/pouchdb';
import { EncodeForURL } from '../utils';

const localSysDB = new PouchDB(Config.db.localDB_SystemData);
const localAppDB = new PouchDB(Config.db.localDB_AppData, {adapter: 'asyncstorage'});

// Login --- Authentication Actions

const emailChanged = (text) => ({
  type: Types.EMAIL_CHANGED,
  payload: text
});

const setLoginUser = (user) => ({
  type: Types.LOGIN_SUCCESS,
  payload: user
});

const passwordChanged = (text) => ({
  type: Types.PASSWORD_CHANGED,
  payload: text
});

const statesChanged = states => ({
  type: Types.STATES_CHANGED,
  payload: states
});

const lgasChanged = lgas => ({
  type: Types.LGAS_CHANGED,
  payload: lgas
});

const terminateLogin = (text) => ({
  type: Types.LOGIN_TERMINATED,
  payload: {}
});

const updateUser = user => ({
  type: Types.UPDATE_USER,
  payload: user
});

memberChanged = member => ({
  type: Types.MEMBER_CHANGED,
  payload: member
});

selectedMemberChanged = member => ({
  type: Types.SELECTED_MEMBER_CHANGED,
  payload: member
});

membersChanged = members => ({
  type: Types.MEMBERS_CHANGED,
  payload: members
});


memberListChanged = member => ({
  type: Types.MEMBER_LIST_CHANGED,
  payload: member
});

memberListRemove = member => ({
  type: Types.MEMBER_LIST_REMOVE,
  payload: member
});

memberListAdd = member => ({
  type: Types.MEMBER_LIST_ADD,
  payload: member
});

const updateMember = member => dispatch => (new Promise((resolve, reject) => {
  if(member._id){
    member.modifiedOn = new Date()
      localAppDB.put(member)
      .then(m =>{
        localAppDB.get(m.id)
        .then(v=> {
          dispatch(memberListChanged(v))
        })
        .catch(err=>console.log(err))        
        resolve(true)
      })
      .catch(err=>{console.log(err); reject(false)})
  }else{
    reject(false);
  }
}));

const loginUser = (credentials) => (dispatch) => {
  if (credentials.username === '' || credentials.password === '') {
    dispatch(loginFailed('Enter email and password'));
  } else {
    dispatch({ type: Types.LOGIN_STARTED });
    let URL = `${Config.environmentAuthority.umsUrl}auth`;
    const opts = {
      method: 'POST',
      body: EncodeForURL(credentials),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    const reached = false;
    fetch(URL, opts)
      .then(res => {
        reached = true;
        return res.json();
      })
      .then(data => {
        if (data.token) {
          URL = `${Config.environmentAuthority.umsUrl}users/me`;
          fetch(URL, { headers: { Authorization: `Bearer ${data.token}` } })
            .then(response => (response.json()))
            .then(userData => {
              getConfigAndSaveUserLocally(userData, dispatch);
            })
            .catch(err => {
              console.log(err);
              dispatch(loginFailed('No such user'));
            });
        } else {
          dispatch(loginFailed('Wrong username or password'));
        }
      })
      .catch(err => {
        if(reached){
          dispatch({ type: Types.LOGIN_FAILED, payload: 'Wrong username or password' });
        } else {
          dispatch({ type: Types.LOGIN_FAILED, payload: 'Could not reach server' });
        }
      });
  }
};

const getConfigAndSaveUserLocally = (user, dispatch) => {
  const nUser = _.omit(user, '_rev');
  nUser.type = 'user';
  storeSysDataLocally(localSysDB, nUser, dispatch);
};

const storeSysDataLocally = (db, user, dispatch) => {
  if(user.roles.includes('ums_role_agent')) {
    db.post(user)
    .then(() => {
      dispatch(setLoginUser(user));
      Actions.main();
    })
    .catch(err => { 
      console.log(err);
      dispatch({ type: Types.LOGIN_FAILED, payload: err });
    });
  } else {
    dispatch({ type: Types.LOGIN_FAILED, payload: 'You are not an ANN Offical Agent' });
  }
};

const loginFailed = (err) => ({
  type: Types.LOGIN_FAILED,
  payload: err
});

const getCurrentUser = () => (dispatch) => {
  localSysDB.query('doc_types/by_userType', {
    key: Config.docTypes.user,
    include_docs: true
  })
    .then(userDoc => {
      if (userDoc.rows.length) {
        dispatch(setLoginUser(_.first(userDoc.rows).doc));
      }
    })
    .catch(err => console.log(`No user account on file : ${err}`));
};

const getCurrentUserAsync = () => (dispatch) => (new Promise((resolve, reject) => {
  localSysDB.allDocs()
    .then(userDoc => {
      const data = _.first(userDoc.rows.filter(row => (row.doc.type === Config.docTypes.user)));
      dispatch(setLoginUser(data ? data.doc : null));
      resolve(data ? data.doc : data);
    })
    .catch(err => reject(`No user account on file : ${err}`));
}));


const getMemberAsync = () => (dispatch) => (new Promise((resolve, reject) => {
  localAppDB.allDocs()
    .then(userDoc => {
      const data = _.first(userDoc.rows.filter(row => (row.doc.doc_type === Config.docTypes.member)));
      dispatch(memberChanged(data ? data.doc : null));
      resolve(data ? data.doc : data);
    })
    .catch(err => reject(`No member profile on file : ${err}`));
}));

const systemDataChanged = () => dispatch => {
  localSysDB.allDocs()
  .then(rec => {
    const states = rec.rows.filter(row => (row.doc.doc_type === Config.docTypes.state)).map(row => (row.doc));
    const lgas = rec.rows.filter(row => (row.doc.doc_type === Config.docTypes.lga)).map(row => (row.doc));
    dispatch(statesChanged(states));
    dispatch(lgasChanged(lgas));
  })
  .catch(err => console.log(err));
};

const AuthActions = {
  loginUser,
  passwordChanged,
  emailChanged,
  loginFailed,
  setLoginUser,
  getCurrentUser,
  getCurrentUserAsync,
  updateUser,
  memberChanged,
  getMemberAsync,
  systemDataChanged,
  updateMember,
  memberListChanged,
  memberListRemove,
  memberListAdd,
  membersChanged,
  selectedMemberChanged
};

export default AuthActions;
