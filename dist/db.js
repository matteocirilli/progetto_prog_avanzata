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
exports.MosseDao = exports.PartiteDao = exports.UtenteDao = exports.Utente = void 0;
exports.syncDb = syncDb;
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('sqlite::memory:');
class Utente extends sequelize_1.Model {
}
exports.Utente = Utente;
class Partite extends sequelize_1.Model {
}
class Mosse extends sequelize_1.Model {
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
    vittorie: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    }, vintePerAbbandono: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    perse: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    persePerAbbandono: {
        type: sequelize_1.DataTypes.INTEGER,
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
        allowNull: true,
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Partite',
});
Mosse.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    descrizione: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    data: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Mosse',
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
    update(email, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Utente.update(changes, {
                where: { email: email }
            });
        });
    }
    vittoria(email, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Utente.update(changes, {
                where: { email: email }
            });
        });
    }
    perdita(email, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Utente.update(changes, {
                where: { email: email }
            });
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
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Partite.destroy({
                where: { id: id }
            });
        });
    }
}
exports.PartiteDao = PartiteDao;
class MosseDao {
    create(mossa) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Mosse.create(mossa);
        });
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Mosse.findByPk(id);
        });
    }
    readAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return Mosse.findAll();
        });
    }
    readByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return Mosse.findAll({
                where: {
                    email: email
                }
            });
        });
    }
}
exports.MosseDao = MosseDao;
