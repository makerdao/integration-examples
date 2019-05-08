const Maker = require('@makerdao/dai');
const McdPlugin = require('@makerdao/dai-plugin-mcd');
const {ETH, COL1} = require('@makerdao/dai-plugin-mcd');

async function start() {
    try {
        let maker = await Maker.create('http', {
            privateKey: '474BEB999FED1B3AF2EA048F963833C686A0FBA05F5724CB6417CF3B8EE9697E',
            url: 'https://kovan.infura.io/v3/c3f0f26a4c1742e0949d8eedfc47be67',
            provider: {
                type: 'HTTP',
                network: 'kovan'
            },
            plugins: [
                [
                    McdPlugin,
                    {
                        cdpTypes: [
                            { currency: ETH, ilk: 'ETH-A' },
                            { currency: COL1, ilk: 'COL1-A' },
                        ]
                    }
                ]
            ]
        });
        await maker.authenticate();
        console.log('authenticated')
        // await maker.service('proxy').ensureProxy();
        // const cdpManager = maker.service('mcd:cdpManager');
        // console.log('cdpManager', cdpManager)
        console.log('maker', maker)

    } catch (error) {
        console.log(error)
    }

}

start()