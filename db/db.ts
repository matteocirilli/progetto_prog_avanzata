import { Sequelize, DataTypes, Model } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');

class Utente extends Model {
    public id!: number;
    public email!: string;
    public token!: number;
    public vittorie!: number;
    public vintePerAbbandono!: number;
    public perse!: number;
    public persePerAbbandono!: number;
    
}

class Partite extends Model {
    public id!: number;
    public emailSfidante1!: string;
    public emailSfidante2!: string;
}

class Mosse extends Model
{
    public id!: number;
    public email!: string;
    public descrizione!: string;
    public data!: Date;
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
        vittorie: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },vintePerAbbandono: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        perse: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        persePerAbbandono: {
            type: DataTypes.INTEGER,
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
            allowNull: true,
            
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

Mosse.init(
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
        descrizione: {
            type: DataTypes.STRING,
            allowNull: true,
            
        },
        data: {
            type: DataTypes.DATE,
            allowNull: true,
            
        },
        
        
     
    },
    {
        sequelize,
        modelName: 'Mosse',
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
    async update(email: string, changes: { token: number }): Promise<void> {
        await Utente.update(changes, {
            where: { email: email }
        });
    }

    async vittoria(email: string, changes: { vittorie: number, vintePerAbbandono?: number }) : Promise<void> {
        await Utente.update(changes, {
            where: { email: email }
        });
    }

    async perdita(email: string, changes: { perse: number, persePerAbbandono?: number }) : Promise<void> {
        await Utente.update(changes, {
            where: { email: email }
        });
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
    async delete(id: number): Promise<void> {
        await Partite.destroy({
            where: { id: id }
        });
    }
}

export class MosseDao implements IDao<Mosse> {
    async create(mossa: {email: string, descrizione: string, data: Date}): Promise<void> {
        await Mosse.create(mossa);
    }

    async read(id: number): Promise<Mosse | null> {
        return Mosse.findByPk(id);
    }

    async readAll(): Promise<Mosse[]> {
        return Mosse.findAll();
    }
    async readByEmail(email: string): Promise<Mosse[]> {
        return Mosse.findAll({
            where: {
                email: email
            }
        });
    }
}