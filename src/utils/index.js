
import PouchDB from 'pouchdb-react-native';
import Config from '../config';

const localSysDB = new PouchDB(Config.db.localDB_SystemData);

export const EncodeForURL = (obj) => {
    const parts = [];
    Object.keys(obj).forEach(i => {
        if (obj[i]) {
            parts.push(`${encodeURIComponent(i)}=${encodeURIComponent(obj[i])}`);
        }
    });
    return parts.join('&');
};

export const IsUndefinedOrNull = (value) => 
(typeof value === 'undefined' || value === '' || value === ' ' || value === null);

export const getSystemDataById = Id => (new Promise((resolve, reject) => {
    if(Id){
        localSysDB.get(Id)
        .then(rec=>{
            resolve(rec)
        })
        .catch(err=>{
            reject('Not found')
        })
    } else {
        reject('Not found')
    }
}));

export const UpdateSyncDoc = (DocId, updateFunc) => {
    const db = new PouchDB(Config.db.localDB_AppData, { adapter: 'asyncstorage' });
    db.get(DocId)
    .then(res => {
        if (res && !res.isSynced) {
            const doc = {...res};
            doc.isSynced = true;
            db.put(doc)
            .then(m => {
                db.get(m.id)
                .then(v=> {
                    switch (doc.doc_type) {
                        case Config.docTypes.prospect:
                            updateFunc(v)
                        break;
                        default:
                        console.log(`Doc Sync: No document type on file. ${doc.doc_type}`);
                    }
                })
                .catch(err=>console.log(err))
            })
            .catch(error => console.log(error));
        }
    })
    .catch(err => console.log(err));
};

