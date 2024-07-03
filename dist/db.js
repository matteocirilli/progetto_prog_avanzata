"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartiteDao = exports.UtenteDao = void 0;
exports.syncDb = syncDb;
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('sqlite::memory:');
class Utente extends sequelize_1.Model {
}
class Partite extends sequelize_1.Model {
}
function syncDb() {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.sync();
    });
}
Utente.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Utente',
});
Partite.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    emailSfidante1: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    emailSfidante2: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Partite',
});
class UtenteDao {
    create(utente) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Utente.create(utente);
        });
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Utente.findByPk(id);
        });
    }
    readAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Utente.findAll();
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Utente.findOne({ where: { email } });
        });
    }
}
exports.UtenteDao = UtenteDao;
class PartiteDao {
    create(partita) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Partite.create(partita);
        });
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Partite.findByPk(id);
        });
    }
    readAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Partite.findAll();
        });
    }
    update(id, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Partite.update(changes, {
                where: { id: id }
            });
        });
    }
}
exports.PartiteDao = PartiteDao;
