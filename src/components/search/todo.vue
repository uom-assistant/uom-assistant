<template>
    <v-card
        class="mx-auto todo-search-container mb-2"
        outlined
    >
        <v-list flat class="list">
            <v-list-item-group
                v-model="ifTodos"
                multiple
                active-class="done"
            >
                <v-list-item v-for="(todo, index) in todos" :key="index">
                    <template v-slot:default="{ active }">
                        <v-list-item-action>
                            <v-checkbox :input-value="active"></v-checkbox>
                        </v-list-item-action>

                        <v-list-item-content>
                            <v-list-item-title>{{ todo.content }}</v-list-item-title>
                        </v-list-item-content>

                        <v-list-item-action class="delete">
                            <v-btn icon @click.stop="removeTodo(todo.rawIndex)">
                                <v-icon color="grey">mdi-delete-outline</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </template>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'todoSearch',
    props: {
        todos: Array,
    },
    data() {
        return {
            ifTodos: [],
            skipSyncBack: false,
        };
    },
    methods: {
        /**
         * Remove one TO-DO from the list by index in widget
         * @param {number} index TO-DO index
         */
        removeTodo(index) {
            this.$store.commit('setSearchNotification', {
                target: 'todo',
                payload: { action: 'delete', index },
            });
        },
        /**
         * Update `ifTodos` based on prop
         */
        updateDone() {
            this.skipSyncBack = true;
            this.ifTodos = [];
            if (this.todos) {
                for (let i = 0; i < this.todos.length; i += 1) {
                    if (this.todos[i].done) {
                        this.ifTodos.push(i);
                    }
                }
            }
            this.$nextTick(() => {
                this.skipSyncBack = false;
            });
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        todos() {
            this.updateDone();
        },
        ifTodos() {
            // Sync states back to widget
            if (!this.skipSyncBack) {
                if (this.todos) {
                    const payload = [];
                    for (let i = 0; i < this.todos.length; i += 1) {
                        payload.push({
                            rawIndex: this.todos[i].rawIndex,
                            done: this.ifTodos.includes(i),
                        });
                    }
                    this.$store.commit('setSearchNotification', {
                        target: 'todo',
                        payload: { action: 'syncDone', payload },
                    });
                }
            }
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        this.updateDone();
    },
};
</script>

<style lang="less">
.todo-search-container {
    position: relative;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
    border-radius: 6px!important;
    contain: layout paint;
    .list {
        background-color: transparent;
        .v-list-item__action {
            margin: 7.5px 16px 7.5px 0;
        }
        .delete {
            margin-right: 0;
            margin-left: 8px;
            opacity: 0;
            transition: .2s;
        }
        .v-list-item {
            background-color: transparent;
            transition: background-color .2s;
            &:hover, &:focus {
                background-color: rgba(0, 0, 0, .04);
                .delete {
                    opacity: 1;
                }
            }
        }
    }
    .done {
        color: rgba(0, 0, 0, .4);
        .v-list-item__title {
            text-decoration: line-through;
        }
    }
}
#app.theme--dark .todo-search-container {
    background-color: #272727;
    .v-list-item {
        &:hover, &:focus {
            background-color: rgba(255, 255, 255, .04);
        }
    }
    .done {
        color: rgba(255, 255, 255, 0.4);
    }
}
</style>
