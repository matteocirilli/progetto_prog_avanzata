import { Sequelize, DataTypes, Model } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');

class Utente extends Model {
    public id!: number;
    public email!: string;
    public token!: number;
}

class Partite extends Model {
    public id!: number;
    public emailSfidante1!: string;
    public emailSfidante2!: string;
}
export async function syncDb (): Promise<void> {
    await sequelize.sync();
}




Utente.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Utente',
    }
);

Partite.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        emailSfidante1: {
            type: DataTypes.STRING,
            allowNull: false,
            
        },
        emailSfidante2: {
            type: DataTypes.STRING,
            allowNull: false,
            
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Partite',
    }
);




interface IDao<T> {
    create(user: T): Promise<void>;
    read(id: number): Promise<T | null>;
    readAll(): Promise<T[]>;
}

export class UtenteDao implements IDao<Utente> {
    async create(utente: { email: string; token: number }): Promise<void> {
        await Utente.create(utente);
    }

    async read(id: number): Promise<Utente | null> {
        return await Utente.findByPk(id);
    }

    async readAll(): Promise<Utente[]> {
        return await Utente.findAll();
    }
    async findByEmail(email: string): Promise<Utente | null> {
        return await Utente.findOne({ where: { email } });
    }

    
}

export class PartiteDao implements IDao<Partite> {
    async create(partita: { emailSfidante1: string; emailSfidante2: string }): Promise<void> {
        await Partite.create(partita);
    }

    async read(id: number): Promise<Partite | null> {
        return await Partite.findByPk(id);
    }

    async readAll(): Promise<Partite[]> {
        return await Partite.findAll();
    }
    async update(id: number, changes: { active: boolean }): Promise<void> {
        await Partite.update(changes, {
            where: { id: id }
        });
    }
}
