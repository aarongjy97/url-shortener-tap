import { Pool } from 'pg';

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'govtechtap',
    password: 'password',
    port: 5432
})

export const transact = async (callback: any) => {
    const client = await pool.connect();

    try {
        await client.query(`begin`);
        const result = await callback(client.query.bind(client));
        await client.query('commit');
        return result;
    } catch (error) {
        await client.query(`rollback`);
        throw error;
    } finally {
        client.release();
    }
}

export const query = pool.query.bind(pool);

