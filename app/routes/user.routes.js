
module.exports = (app, methods) => {
    const User = methods.loadController('user');

    User.methods.post('register', User.createUser, { auth: false });
    User.methods.post('authenticate', User.authenticate, { auth: false });
    User.methods.get('list', User.listUser, { auth: true });
    User.methods.put('update/:id', User.updateUser, { auth: true });
    User.methods.get('search', User.searchUser, { auth: true });



}