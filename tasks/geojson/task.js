import fs from 'fs';
import { kml } from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import fetch from 'node-fetch';
import {FormData, File} from "formdata-node"
import {FormDataEncoder} from "form-data-encoder"
import {Readable} from "stream"

try {
    const dotfile = new URL('.env', import.meta.url);

    fs.accessSync(dotfile);

    Object.assign(process.env, JSON.parse(fs.readFileSync(dotfile)));
    console.log('ok - .env file loaded');
} catch (err) {
    console.log('ok - no .env file loaded');
}

export default class Task {
    constructor() {
        this.etl = process.env.ETL_API;
        this.layer = process.env.ETL_LAYER;
        if (!this.etl) throw new Error('No ETL API URL Provided');
        if (!this.layer) throw new Error('No ETL Layer Provided');
    }

    async control() {
        let layer = await fetch(new URL(`/api/layer/${this.layer}`, this.etl));
        layer = await layer.json();

        if (layer.mode !== 'file') throw new Error('Only File Layers can be processed');
        if (!layer.data.raw_asset_id) throw new Error('Layer does not contain an raw_asset_id');

        let data = await fetch(new URL(`/api/asset/${layer.data.raw_asset_id}/raw`, this.etl));

        const dom = new DOMParser().parseFromString(await data.text(), 'text/xml');

        const converted = kml(dom).features.map((feat) => {
            return JSON.stringify(feat);
        }).join('\n');
        console.error('ok - converted to GeoJSON');

        const form = new FormData();
        form.append('file', new File([converted], 'processed.ldgeojson'));

        const encoder = new FormDataEncoder(form)

        let asset = await fetch(new URL(`/api/asset`, this.etl), {
            method: 'POST',
            headers: encoder.headers,
            body: Readable.from(encoder)
        });
        asset = await asset.json();
        console.error(`ok - Uploaded Asset: ${asset.id}`);

        layer.data.std_asset_id = asset.id;
        layer = await fetch(new URL(`/api/layer/${layer.id}`, this.etl), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: layer.data
            })
        });
        layer = await layer.json();

        console.error(layer);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const task = new Task();
    task.control();
}

