const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');

let exportedMethods = {
    async addNewUser(userInfo) {
        try {
            const userCollection = await users();
            let newUser = await userCollection.insertOne(userInfo)
            return newUser.insertedId;
        } catch (err) {
            return err
        }
    },

    async deleteUser(uid) {
        try {
            const userCollection = await users();
            let deletedUser = await userCollection.deleteOne({ uid: uid })
            return true

        } catch (err) {
            return err;
        }
    },

    async getAllUsers() {
        const userCollection = await users();
        let userFound = await userCollection.find({}).toArray();
        return userFound
    },

    async getAdmins() {
        const userCollection = await users();
        let adminsFound = await userCollection.find({ role: 'admin' }).toArray();
        console.log(adminsFound)
        return adminsFound
    },

    async getEmployees(facilityName) {
        const userCollection = await users();
        let adminsFound = await userCollection.find({ role: 'employee' }, { facility: facilityName }).toArray();
        console.log(adminsFound)
        return adminsFound
    },

    async getUserById(uid) {
        try {
            const userCollection = await users();
            let userFound = await userCollection.find({ uid: uid }).toArray();
            return userFound[0]
        } catch (err) {
            return err;
        }
    },

    async patchUser(uid, updateInfo) {
        try {
            const userCollection = await users();
            let doc = await userCollection.find({ 'uid': uid }).toArray();
            doc = doc[0]

            if (doc.role === 'patient') {
                doc.firstName = (updateInfo.firstName) ? updateInfo.firstName : doc.firstName,
                doc.lastName = (updateInfo.lastName) ? updateInfo.lastName : doc.lastName,
                doc.email = (updateInfo.email) ? updateInfo.email : doc.email,
                doc.dob = (updateInfo.dob) ? updateInfo.dob : doc.dob;
                doc.gender = (updateInfo.gender) ? updateInfo.gender : doc.gender;
                doc.address = (updateInfo.address) ? updateInfo.address : doc.address;
                doc.conditions = (updateInfo.conditions) ? updateInfo.conditions : doc.conditions;
                doc.insurance = {
                    'id': (updateInfo.insuranceID) ? updateInfo.insuranceID.trim() : doc.insurance.id,
                    'provider': (updateInfo.insuranceProvider) ? updateInfo.insuranceProvider.trim() : doc.insurance.provider
                };
            } else if (doc.role === 'employee') {

            } else if (doc.role === 'admin') {
                doc.email = updateInfo.email || doc.email
                doc.phone = updateInfo.phone.trim();
                doc.url = updateInfo.website.trim();
                doc.address = updateInfo.address || doc.address
                doc.hours = {
                    'Monday': updateInfo.Monday,
                    'Tuesday': updateInfo.Tuesday,
                    'Wednesday': updateInfo.Wednesday,
                    'Thursday': updateInfo.Thursday,
                    'Friday': updateInfo.Friday,
                    'Saturday': updateInfo.Saturday,
                    'Sunday': updateInfo.Sunday
                } || doc.hours,
                    doc.geoJSON = updateInfo.geoJSON || doc.geoJSON

            } else {
                return false
            }

            let patched = await userCollection.replaceOne({ uid: uid }, doc);
            return patched

        } catch (err) {
            return err;
        }

    },

    async updateUser(_id, updateInfo) {
        try {
            const userCollection = await users();
            let doc = await userCollection.find({ _id: ObjectId(_id) }).toArray();
            doc = doc[0]

            type = (doc.uid) ? doc.role : null

            if (type === null) {
                doc['uid'] = updateInfo.uid

            } else if (type === 'facilityUser') {
                return
            } else {
                doc.address = {
                    'street': updateInfo.address1.trim(),
                    'unit': updateInfo.address2 ? updateInfo.address2.trim() : null,
                    'city': updateInfo.city.trim(),
                    'state': updateInfo.state.trim(),
                    'zip': updateInfo.zip.trim()
                }

                if (type === 'patient') {
                    doc.dob = updateInfo.dob;
                    doc.gender = updateInfo.gender;
                    doc.ssn = updateInfo.ssn;
                    doc.conditions = updateInfo.conditions;
                    doc.insurance = {
                        'id': updateInfo.insuranceID.trim(),
                        'provider': updateInfo.insuranceProvider.trim()
                    };
                }

                if (type === 'admin') {
                    doc.phone = updateInfo.phone.trim();
                    doc.url = updateInfo.website.trim();
                    doc.hours = {
                        'Monday': updateInfo.Monday,
                        'Tuesday': updateInfo.Tuesday,
                        'Wednesday': updateInfo.Wednesday,
                        'Thursday': updateInfo.Thursday,
                        'Friday': updateInfo.Friday,
                        'Saturday': updateInfo.Saturday,
                        'Sunday': updateInfo.Sunday
                    },
                        doc.geoJSON = updateInfo.geoJSON
                }
            }

            let updated = await userCollection.replaceOne({ _id: ObjectId(_id) }, doc);
            return updated
        } catch (err) {
            return err;
        }
    }
};

module.exports = exportedMethods;