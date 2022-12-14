<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item" aria-current="page"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Layers</a></li>
                        </ol>

                        <div class='ms-auto'>
                            <div class='btn-list'>
                                <a @click='query.shown = !query.shown' class="cursor-pointer btn btn-secondary">
                                    <SearchIcon/>
                                </a>

                                <a @click='$router.push("/layer/new")' class="cursor-pointer btn btn-primary">
                                    New Layer
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div v-if='query.shown' class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <label class="form-label">Layer Search</label>
                            <div class="input-icon mb-3">
                                <input v-model='query.search' type="text" class="form-control" placeholder="Search…">
                                <span class="input-icon-addon">
                                    <SearchIcon/>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <None
                    v-if='!list.layers.length'
                    label='Layers'
                    @create='$router.push("/layer/new")'
                />
                <div :key='layer.id' v-for='layer in list.layers' class="col-lg-12">
                    <div class="card">
                        <div class="card-header">
                            <template v-if='layer.mode === "live"'>
                                <span class="status-indicator status-green status-indicator-animated">
                                      <span class="status-indicator-circle"></span>
                                      <span class="status-indicator-circle"></span>
                                      <span class="status-indicator-circle"></span>
                                </span>
                            </template>
                            <template v-else>
                                <span class="status-indicator status-blue status-indicator-animated">
                                      <span class="status-indicator-circle"></span>
                                      <span class="status-indicator-circle"></span>
                                      <span class="status-indicator-circle"></span>
                                </span>
                            </template>

                            <a @click='$router.push(`/layer/${layer.id}`)' class="card-title cursor-pointer" v-text='layer.name'></a>

                            <div class='ms-auto'>
                                <div class='btn-list'>
                                    <SettingsIcon class='cursor-pointer' @click='$router.push(`/layer/${layer.id}/edit`)'/>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" v-text='layer.description'>
                        </div>
                        <div class="card-footer">
                            Last updated <span v-text='timeDiff(layer.updated)'/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import None from './cards/None.vue';
import PageFooter from './PageFooter.vue';
import {
    SettingsIcon,
    SearchIcon
} from 'vue-tabler-icons'

export default {
    name: 'Layers',
    data: function() {
        return {
            err: false,
            query: {
                shown: false,
                search: ''
            },
            list: {
                layers: []
            }
        }
    },
    watch: {
        'query.search': function() {
            this.fetchList();
        }
    },
    mounted: async function() {
        await this.fetchList();
    },
    methods: {
        timeDiff: function(updated) {
            const msPerMinute = 60 * 1000;
            const msPerHour = msPerMinute * 60;
            const msPerDay = msPerHour * 24;
            const msPerMonth = msPerDay * 30;
            const msPerYear = msPerDay * 365;
            const elapsed = +(new Date()) - updated;

            if (elapsed < msPerMinute) return Math.round(elapsed/1000) + ' seconds ago';
            if (elapsed < msPerHour) return Math.round(elapsed/msPerMinute) + ' minutes ago';
            if (elapsed < msPerDay ) return Math.round(elapsed/msPerHour ) + ' hours ago';
            if (elapsed < msPerMonth) return '~' + Math.round(elapsed/msPerDay) + ' days ago';
            if (elapsed < msPerYear) return '~' + Math.round(elapsed/msPerMonth) + ' months ago';
            return '~' + Math.round(elapsed/msPerYear ) + ' years ago';
        },
        fetchList: async function() {
            const url = window.stdurl('/api/layer');
            if (this.query.shown && this.query.search) url.searchParams.append('filter', this.query.search);
            this.list = await window.std(url);
        }
    },
    components: {
        None,
        SettingsIcon,
        SearchIcon,
        PageFooter,
    }
}
</script>
