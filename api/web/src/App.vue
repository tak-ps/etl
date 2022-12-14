<template>
<div class='page'>
    <header class='navbar navbar-expand-md navbar-dark d-print-none'>
        <div class="container-xl">
            <div class="col">
                <div class="page-pretitle">TAK Public Safety</div>
                <h2 class="page-title">ETL Data Layers</h2>
            </div>

            <div class='ms-auto'>
                <div class='btn-list'>
                    <a href="/docs/" class="btn btn-dark" target="_blank" rel="noreferrer">
                        <CodeIcon/>
                        Docs
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div v-if='user' class="navbar-expand-md">
        <div class="collapse navbar-collapse" id="navbar-menu">
            <div class="navbar navbar-light">
                <div class="container-xl">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <HomeIcon/>
                                </span>
                                <span class="nav-link-title">Home</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/connection")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <NetworkIcon/>
                                </span>
                                <span class="nav-link-title">Connections</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/layer")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <DatabaseIcon/>
                                </span>
                                <span class="nav-link-title">Layers</span>
                            </a>
                        </li>
                    </ul>
                    <div class='ms-auto'>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link cursor-pointer" @click='$router.push("/admin")'>
                                    <span class="nav-link-icon d-md-none d-lg-inline-block">
                                        <AdjustmentsIcon/>
                                    </span>
                                    <span class="nav-link-title">Admin</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <router-view
        :ws='ws'
    />

    <TablerError v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import '@tabler/core/dist/js/tabler.min.js';
import '@tabler/core/dist/css/tabler.min.css';
import {
    CodeIcon,
    HomeIcon,
    NetworkIcon,
    DatabaseIcon,
    AdjustmentsIcon
} from 'vue-tabler-icons';
import {
    TablerError
} from '@tak-ps/vue-tabler';

export default {
    name: 'Tak-PS-Stats',
    data: function() {
        return {
            user: null,
            ws: null,
            err: null,
            server: null,
        }
    },
    errorCaptured: function(err) {
        this.err = err;
    },
    watch: {
        async $route() {
            if (localStorage.token) return await this.getLogin();
            if (this.$route.name !== 'login') this.$router.push("/login");
        }
    },
    mounted: async function() {
        const url = window.stdurl('/');
        url.protocol = 'ws:';

        this.ws = new WebSocket(url);
        this.ws.addEventListener('error', (err) => {
            this.err = err;
        });

        if (localStorage.token) return await this.getServer();
        if (this.$route.name !== 'login') this.$router.push("/login");

        await this.getServer();
    },
    methods: {
        getLogin: async function() {
            try {
                this.user = await window.std('/api/login');
            } catch (err) {
                delete localStorage.token;
                this.$router.push("/login");
            }
        },
        getServer: async function() {
            this.server = await window.std('/api/server');

            if (this.server.status === 'unconfigured') {
                this.$router.push("/admin");
            }
        }
    },
    components: {
        HomeIcon,
        CodeIcon,
        NetworkIcon,
        DatabaseIcon,
        TablerError,
        AdjustmentsIcon
    }
}
</script>
