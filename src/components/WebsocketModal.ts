import m = require('mithril');
import { IBadRowsSummary } from '../ts/types';
import util = require('../ts/util');

let websocket: WebSocket|null = null;
let websocketMessageListener: any = null;
const startStreaming = (fields: HTMLFormControlsCollection, receiveEvents: (events: object[]) => void): void => {
    if (websocket !== null) {
        stopStreaming();
    }

    const wsUrl = new URL((fields.namedItem('websocket-endpoint') as HTMLInputElement).value);
    wsUrl.searchParams.set('installId', (fields.namedItem('app-install-id') as HTMLInputElement).value);

    websocketMessageListener = (ev: MessageEvent): void => {
        try {
            const message = JSON.parse(ev.data);
            if (message && message.events && message.events.length) {
                receiveEvents(message.events);
            }
        } catch (error) {
            console.error(error);
        }
    };

    websocket = new WebSocket(`${wsUrl.protocol}//${wsUrl.host}${wsUrl.pathname}${wsUrl.search}`);
    websocket.addEventListener('message', websocketMessageListener);
};

const stopStreaming = (): void => {
    if (websocket !== null) {
        websocket.removeEventListener('message', websocketMessageListener);
        websocket.close();

        websocket = null;
        websocketMessageListener = null;
    }
};

export = {
    view: (vnode: m.Vnode<IBadRowsSummary>) => m('div.modal',
        { className: vnode.attrs.modal === 'websocket' ? 'is-active' : 'is-inactive' },
        [
            m('div.modal-background'),
            m('form.modal-card', {
                onsubmit: (e: Event) => {
                    e.preventDefault();
                    const fields = (e.target as HTMLFormElement).elements;
                    startStreaming(fields, (events) => {
                        const requests = util.wsToRequests(events);
                        vnode.attrs.addRequests('Websocket Data', requests);
                    });

                    vnode.attrs.setModal(undefined);
                }},
                [
                    m('header.modal-card-head', [
                        m('p.modal-card-title', 'Stream Websocket Data'),
                        m('button.delete[type=reset]', { onclick: () => vnode.attrs.setModal(undefined) }),
                    ]),
                    m('section.modal-card-body', [
                        m('p',
                            `Inspect live data streaming from Catch's tracking Websocket.`,
                        ),
                        m('.field', [
                            m('label.label[for=websocket-endpoint]', 'Websocket Endpoint'),
                            m('.control', m('input#websocket-endpoint.input[name=endpoint][type=url][required]', {
                                placeholder: 'wss://tracking-stream.absinthe.cgws.com.au',
                            })),
                        ]),
                        m('.field', [
                            m('label.label[for=app-install-id]', 'App Install ID'),
                            m('.control', m('input#app-install-id.input[name=index][type=text][required]', {
                                placeholder: '31fd4d99-6754-4aaa-9256-74a27d51702e',
                            })),
                        ]),
                    ]),
                    m('footer.modal-card-foot', [
                        m('button.button[type=submit]', 'Start'),
                        m('button.button', {
                            disabled: websocket === null,
                            onclick: () => stopStreaming(),
                        }, 'Stop Streaming'),
                    ]),
                ]),
        ],
    ),
};
