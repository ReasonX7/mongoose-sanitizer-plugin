'use strict';

const mockgoose = require('mockgoose');
const Mongoose = require('mongoose').Mongoose;
const mongoose = new Mongoose();

const sanitizerPlugin = require('../lib/sanitizer-plugin');

let userData = {
    firstName: '<script>alert(2)</script>',
    lastName: '<p>Name</p>'
};

let userDataDeep = {
    firstName: '<script>alert(2)</script>',
    lastName: '<p>Name</p>',
    additional: {
        bio: '<b>some text</b>'
    }
};

describe('Mongoose Sanitizer', () => {
    beforeAll(done => {
        mockgoose(mongoose).then(() => {
            mongoose.connect('mongodb://localhost:27017/sanitizer-plugin-test', done);
        })
    });

    afterEach(done => {
        mockgoose.reset(done);
    });

    it('should escape all field', done => {
        let Schema = mongoose.Schema({
            firstName: String,
            lastName: String
        });

        Schema.plugin(sanitizerPlugin);

        let User = mongoose.model('User0', Schema);
        let user = new User(userData);

        user.save((err, result) => {
            expect(result.firstName).toEqual('&lt;script&gt;alert(2)&lt;/script&gt;');
            expect(result.lastName).toEqual('&lt;p&gt;Name&lt;/p&gt;');

            done();
        });
    });

    it('should escape only included fields', done => {
        let Schema = mongoose.Schema({
            firstName: String,
            lastName: String
        });

        Schema.plugin(sanitizerPlugin, { include: ['firstName'] });

        let User = mongoose.model('User1', Schema);
        let user = new User(userData);

        user.save((err, result) => {
            expect(result.firstName).toEqual('&lt;script&gt;alert(2)&lt;/script&gt;');
            expect(result.lastName).toEqual('<p>Name</p>');

            done();
        });
    });

    it('should escape all fields except excluded ones', done => {
        let Schema = mongoose.Schema({
            firstName: String,
            lastName: String
        });

        Schema.plugin(sanitizerPlugin, { exclude: ['firstName'] });

        let User = mongoose.model('User2', Schema);
        let user = new User(userData);

        user.save((err, result) => {
            expect(result.firstName).toEqual('<script>alert(2)</script>');
            expect(result.lastName).toEqual('&lt;p&gt;Name&lt;/p&gt;');

            done();
        });
    });

    it('should sanitize included field', done => {
        let Schema = mongoose.Schema({
            firstName: String,
            lastName: String
        });

        Schema.plugin(sanitizerPlugin, { mode: 'sanitize' });

        let User = mongoose.model('User3', Schema);
        let user = new User(userData);

        user.save((err, result) => {
            expect(result.firstName).toEqual('');
            expect(result.lastName).toEqual('<p>Name</p>');

            done();
        });
    });
});