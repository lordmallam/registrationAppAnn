const logo = require('../src/images/logo.png');
const hostIP = '192.168.8.5';
const host = `http://${hostIP}`;
const dbHost = `http://admin:Password1@${hostIP}:5984/`;
const db_name = 'ann_db';

const Config = {
  environmentAuthority: {
    couchdbUrl: `${dbHost}`, // CouchDB instance where environment_db resides.
    remoteDB: `${db_name}`,
    apiUrl: `${host}:9001/api/`,
    umsUrl: `${host}:9001/ums/`
  },
  db: {
    localDB_SystemData: 'sysDataRegister',
    localDB_AppData: 'appDataRegister',
    remoteDB: `${dbHost}${db_name}`
  },
  resources: {
    logo,
    footerNote: 'ANN Registration v 1.0.1',
    appName: 'ANN Registration 2018',
    version: 'v 1.0'
  },
  docTypes: {
    user: 'user',
    member: 'member',
    state: 'state',
    lga: 'lga',
    prospect: 'prospect'
  }
};

export default Config;
