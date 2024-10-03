const audio = await Service.import('audio')
const battery = await Service.import('battery')
const mpris = await Service.import('mpris')
const hyprland = await Service.import('hyprland')
const tray = await Service.import('systemtray')
import brightness from './brightness.js'

const time = Variable('', {
    poll: [1000, 'date +%T'],
})

function nothing_playing() {
    App.closeWindow('player_window')
    return Widget.Box({
        child: Widget.Label({
            label: 'Nada tocando :('
        })
    })
}

const player_title = player => Widget.Button({
    on_clicked: () => App.toggleWindow('player_window'),
    label: player.bind('track_title')
})

const player_widget = Widget.Box({
    children: mpris.bind('players').as(p => p.length > 0
        ? p.map(player_title)
        : [nothing_playing()]),
    class_name: 'player_box'
})

const player_spawn_control = Widget.Box({
    children: mpris.bind('players').as(p => p
        .map(player_control))
})

function player_control(player) {
    const cover = Widget.Box({
        hpack: 'start',
        css: player.bind('cover-path').transform(p => (`
            background-size: 100px;
            background-position: center;
            background-repeat: no-repeat;
            background-image: url('${p}');
            min-height: 80px;
            padding-left: 140px;
        `)),
    })

    const previous = Widget.Button({
        css: 'padding-right: 30px',
        hpack: 'start',
        label: '󰒮',
        on_clicked: () => player.previous(),
        
    })

    const next = Widget.Button({
        css: 'padding-left: 30px',
        hpack: 'end',
        label: '󰒭',
        on_clicked: () => player.next(),
    })

    const playpause = Widget.Button({
        hpack: 'center',
        on_clicked: () => player.playPause(),
        label: player.bind('play-back-status').transform(i => {
            switch (i) {
                case 'Playing':
                    return ''
                case 'Paused':
                    return '󰐊'
                case 'Stopped':
                    return '󰐊'
            }
        }),
    })
        
    const progress = Widget.Slider({
        class_name: 'progress_slider',
        width_request: 130,
        draw_value: false,
        value: 0,
        on_change: ({ value }) => player.position = value * player.length,
        }).hook(mpris, self => {
            function positionUpdate(){ 
                return self.value = (player.position / player.length)
            }

            if (player.position) {
                self.poll(1000, positionUpdate)
            }
    })

    const title = Widget.Box({
        hexpand: true,
        child: Widget.Label({
            label: player.bind('track-title').as(p => `${p}`),
            css: 'padding-top: 20px; margin-right: 20px;'
        })
    })

    const shuffle = Widget.Button({
        css: 'padding-right: 10px;',
        label: '󰒝',
        on_clicked: () => player.shuffle(),
    })
    
    const loop = Widget.Button({
        css: 'padding-left: 10px;',
        on_clicked: () => player.loop(),
        label: player.bind('loop-status').transform(l => {
            switch (l) {
                case 'None':
                    loop.class_name = 'none'
                    return "󰑗"
                case 'Track':
                    loop.class_name = 'track'
                    return '󰑘'
                case 'Playlist':
                    loop.class_name = 'playlist'
                    return '󰑖'
            }
        })
    })

    const artist = Widget.Box({
        child: Widget.Label({
            label: player.bind('track-artists').as(p => `${p}`),
        }),
    })

    const controller = Widget.Box({
        css: 'margin-top: 15px; margin-right: 20px;',
        hpack: 'center',
        children: [
            shuffle,
            progress,
            loop,
        ]
    })

    const song_controller = Widget.Box({
        css: 'margin-top: 5px; margin-right: 20px;',
        hpack: 'center',
        children: [
            previous,
            playpause,
            next
        ]
    })

    const all = Widget.Box({
        hpack: 'center',
        vpack: 'start',
        vertical: true,
        children: [
            title,
            artist,
            controller,
            song_controller
        ]
    })
    
    
    return Widget.Box({
        class_name: 'player_window',
        children: [
            Widget.EventBox({
                on_hover_lost: () => App.closeWindow('player_window'),
            }),
            cover,
            all,
        ],
    })
}

const workspaces_widget = Widget.Box({
    children: [
        Widget.Icon({
            icon: hyprland.active.client.bind('class')
        }),
        Widget.Label({
            hpack: 'center',
            label: hyprland.active.workspace.bind('name').as(w => `${w}`)
        }),
    ],
    hexpand: false,
    css: 'padding-left: 10px;'
}) 

const volume_widget = Widget.Box({
    hpack: 'end',
    children: [
        Widget.Box({
            css: 'background-color: transparent; padding-right: 10px; padding-left: 10px',
            child: Widget.Icon().hook(audio.speaker, self => {
                const volume = audio.speaker.volume * 100
                const icon = [
                    [80, 'overamplified'],
                    [50, 'high'],
                    [20, 'medium'],
                    [1, 'low'],
                    [0, 'muted'],
                // @ts-ignore
                ].find(([threshold]) => threshold <= volume)?.[1];
                if (audio.speaker.is_muted) {
                    self.icon = 'audio-volume-muted-symbolic';
                } else {
                    self.icon = `audio-volume-${icon}-symbolic`;
                }
            }),
        }),
        Widget.Slider({
            class_name: 'volume_slider',
            widthRequest: 80,
            draw_value: false,
            min: 0,
            max: 1,
            value: audio.speaker.bind('volume'),
            on_change: ( { value } ) => {
                audio.speaker.volume = value;
            },
        })
    ]
})

const battery_widget = Widget.Box({
    children: [
        Widget.Icon({
            css: 'padding-left: 10px; padding-right: 5px'
        }).hook(battery, self => {
            self.icon = `${battery.icon_name}`
        })
,        Widget.Label({
            css: 'padding-right: 10px;'
        }).hook(battery, self => {
            self.label = `${battery.percent}%`
        })
    ]
})

const brightness_widget = Widget.Box({
    children: [
        Widget.Label({
            label: '',
            css: 'padding-right: 15px;'
        }),
        Widget.Slider({
            class_name: 'brightness_slider',
            draw_value: false,
            widthRequest: 80,
            on_change: self => brightness.sc_value = self.value,
            value: brightness.bind('sc_value'),
        })
    ]
})

const clock_widget = Widget.Button({
    on_clicked: () => App.toggleWindow('tray_window'),
    child: Widget.Box({
        children: [
            Widget.Label({
                label: time.bind().as(t => `  ${t}`),
                css: 'padding-right: 10px'
            })
        ]
    })  
})

const sliders = Widget.Box({
    class_name: 'sliders',
    hpack: 'end',
    children: [
        brightness_widget,
        volume_widget,
    ],
})

const status = Widget.Box({
    class_name: 'status',
    children: [
        battery_widget,
        clock_widget
    ]
})

const right = Widget.CenterBox({
    start_widget: sliders,
    end_widget: status,
})

const tray_notification = tray => Widget.Box({
    child: Widget.Label({
        label: tray.bind('title')
    })
})
const tray_widget = Widget.Box({
    children: tray.bind('items').as(p => p.map(tray_notification))
})

const all = Widget.CenterBox({
    start_widget: Widget.Box({
        child: workspaces_widget,
        hpack: 'start',
        class_name: 'start',
    }),
    center_widget: Widget.Box({
        child: player_widget,
        hpack: 'center',
    }),
    end_widget: Widget.Box({
        child: right,
        hpack: 'end',
        class_name: 'end',
        css: 'background-color: transparent;'
    }),
    hexpand: false,
})

const player_window = Widget.Window({
    child: player_spawn_control,
    name: 'player_window',
    anchor: ['top'],
    margins: [6, 6, 6, 6],
    exclusivity: 'normal',
    keymode: 'on-demand',
    class_name: 'player_window'
}).keybind('Escape', self => App.closeWindow('player_window'))

const tray_window = Widget.Window({
    child: tray_widget,
    name: 'tray_window',
    anchor: ['top', 'right'],
    margins: [6, 6, 6, 6],
    exclusivity: 'normal',
    keymode: 'on-demand',
    class_name: 'player_window'
}).keybind('Escape', self => App.closeWindow('player_window'))


const bar = Widget.Window({
    child: all,
    name: 'bar',
    anchor: ['top', 'left', 'right'],
    margins: [6, 6, 0, 6],
    exclusivity: 'exclusive',
    class_name: 'window'
})

App.config({
    windows: [bar, player_window, tray_window],
    style: './style.scss'
})