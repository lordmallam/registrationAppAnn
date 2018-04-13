import Types from '../actions/types';
import _ from 'lodash';

const INITIAL_STATE = {
  email: '',
  password: '',
  user: null,
  error: '',
  isLoading: false,
  member: null,
  states: [],
  lgas: [],
  memberList: [],
  selectedMember: null
};

export default (state = INITIAL_STATE, action) => {
  let newMemberList = [];
  const findIndex = arr => arr.findIndex(x => x._id === action.payload._id);
  const init = () => {
    newMemberList = _.cloneDeep(state.memberList);
  };

  switch (action.type) {
    case Types.EMAIL_CHANGED:
      return { ...state, email: action.payload, error: '', isLoading: false };
    case Types.PASSWORD_CHANGED:
      return { ...state, password: action.payload, error: '', isLoading: false };
    case Types.LOGIN_SUCCESS:
      return { ...state, user: action.payload, isLoading: false, error: '' };
    case Types.MEMBER_CHANGED:
      return { ...state, member: action.payload};
    case Types.LOGIN_FAILED:
      return { ...state, error: action.payload, password: '', isLoading: false };
    case Types.LOGIN_STARTED:
      return { ...state, error: '', isLoading: true };
    case Types.UPDATE_USER:
      return { ...state, user: action.payload };
    case Types.STATES_CHANGED:
      return { ...state, states: action.payload };
    case Types.SELECTED_MEMBER_CHANGED:
      return { ...state, selectedMember: action.payload };
    case Types.MEMBERS_CHANGED:
      return { ...state, memberList: action.payload };
    case Types.LGAS_CHANGED:
      return { ...state, lgas: action.payload };
    case Types.MEMBER_LIST_CHANGED:
      init();
      const index = findIndex(newMemberList);
      newMemberList[index] = action.payload;
      return { ...state, memberList: newMemberList };
    case Types.MEMBER_LIST_ADD:
      init();
      newMemberList.unshift(action.payload);
      return { ...state, memberList: newMemberList };
    case Types.MEMBER_LIST_REMOVE:
      init();
      index = findIndex(newMemberList);
      newMemberList.splice(findIndex, 1);
      return { ...state, memberList: newMemberList };
    case Types.LOGOUT:
      return INITIAL_STATE;
    default:
      return state;
  }
};