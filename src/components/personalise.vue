<template>
    <v-card class="personalise-container mx-auto rounded-lg container" outlined>
        <div class="main" @dragover.prevent @drop.prevent>
            <p class="mb-3 text--secondary d-flex justify-space-between">
                {{ $t('description') }}
                <span class="d-flex ml-3 flex-shrink-0">
                    <span class="mr-2 text--secondary">{{ $t('b&w') }}</span>
                    <v-switch
                        v-model="bw"
                        class="mr-n2"
                        dense
                        hide-details
                        :disabled="selected === '' && customURL === ''"
                        @change="toggleBw"
                    ></v-switch>
                </span>
            </p>
            <div class="loading" v-if="loading">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else>
                <div v-for="item in data" :key="item.cat">
                    <h1 class="text-h6">{{ $t(item.name) }}</h1>
                    <h2 class="text-body-1 text--disabled mt-n1" v-if="item.subtitle">{{ item.subtitle }}</h2>
                    <div class="mb-5">
                        <v-btn
                            v-for="i in item.num"
                            :key="`${item.cat}-${i}`"
                            :style="{ backgroundImage: `url(https://cdn.jsdelivr.net/gh/uom-assistant/uoma-wallpapers/images/thumbnails/${item.cat}-${i}.jpg)`, backgroundPosition: `50% ${item.positions[i - 1] }%` }"
                            :class="{ selected: selected === `${item.cat}-${i}`, bw }"
                            @click="changePreDefined(item.cat, i, item.positions[i - 1])"
                            class="mr-3 mt-2 bg-btn"
                            dark
                            depressed
                        >
                            <v-icon v-show="selected === `${item.cat}-${i}`">mdi-check</v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
            <h1 class="text-h6">
                {{ $t('customise') }}
                <v-btn depressed small class="float-right mt-1" @click="clearCustom" :disabled="customURL === ''">
                    <v-icon small class="mr-2">mdi-close</v-icon>
                    {{ $t('clear') }}
                </v-btn>
                <v-slider
                    class="float-right mr-2 slider"
                    hide-details
                    thumb-label
                    max="100"
                    min="0"
                    :title="$t('position')"
                    :disabled="customURL === ''"
                    @input="updatePositon"
                    @end="store"
                    v-model="sliderPosition"
                ></v-slider>
            </h1>
            <div class="uploader rounded-lg" :class="{ 'drag-over': isDragOver }" @click="$refs.attachmentInput.click()">
                <div class="uploader-bg rounded-lg" :style="{ backgroundImage: `url(${customURL})`, backgroundPosition: `50% ${selectedPosition}%` }" :class="{ bw }"></div>
                <div class="drop-layer" @dragover="isDragOver = true" @dragleave="isDragOver = false" @drop="handleFileDrop">
                    <v-icon x-large color="primary" class="mb-3">mdi-file-hidden</v-icon>
                    <span class="primary--text">{{ $t('drop_file') }}</span>
                </div>
                <v-icon large class="mb-2">mdi-plus</v-icon>
                <span>{{ $t('upload') }}</span>
            </div>
            <input type="file" id="add-attachment" name="add-attachment" class="d-none" ref="attachmentInput" @change="handleFileInput" accept=".gif,.jpg,.jpeg,.png,.webp">
        </div>
        <v-dialog
            v-model="tooLargeDialog"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('too_large') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('too_large_body') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="tooLargeDialog = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="tooManyDialog"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('too_many') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('too_many_body') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="tooManyDialog = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="notImageDialog"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('not_a_image') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('not_a_image_body') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="notImageDialog = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';
import localForage from 'localforage';

import betterFetch from '@/tools/betterFetch';

export default {
    name: 'personalise',
    data() {
        return {
            loading: false,
            error: false,
            data: [],
            lastUpdated: 0,
            selected: '',
            selectedType: '',
            selectedPosition: 50,
            customURL: '',
            sliderPosition: 50,
            bw: false,
            tooLargeDialog: false,
            tooManyDialog: false,
            notImageDialog: false,
            isDragOver: false,
        };
    },
    methods: {
        /**
         * Load pre-defined image set from GitHub
         */
        async loadImages() {
            if (this.loading || new Date().valueOf() - this.lastUpdated <= 1200000) {
                return;
            }

            this.loading = true;

            let requestFailed = false;
            // Send request
            const response = await betterFetch('https://cdn.jsdelivr.net/gh/uom-assistant/uoma-wallpapers@latest/images.json').catch(() => {
                this.loading = false;
                this.error = true;
                requestFailed = true;
            });

            if (requestFailed) {
                return;
            }

            this.data = response;
            this.loading = false;
            this.lastUpdated = new Date().valueOf();
        },
        /**
         * Set the background image to a pre-defined image
         * @param {string} cat image category
         * @param {number} index image index
         * @param {string} position image position
         */
        changePreDefined(cat, index, position) {
            if (this.selected !== `${cat}-${index}`) {
                this.selected = `${cat}-${index}`;
                this.selectedType = 'pre-defined';
                this.selectedPosition = position;
                this.sliderPosition = 50;
                this.clearCustom(false);
                this.$emit('change', {
                    image: `https://cdn.jsdelivr.net/gh/uom-assistant/uoma-wallpapers/images/${this.selected}.jpg`,
                    position: this.selectedPosition,
                });
            } else {
                // Clear
                this.selected = '';
                this.selectedType = '';
                this.selectedPosition = 0;
                this.sliderPosition = 50;
                this.$emit('change', {
                    image: '',
                    position: 50,
                });
            }

            // Save changes
            this.store();
        },
        /**
         * Store current background image info into localStorage
         */
        store() {
            localStorage.setItem('header_bg', JSON.stringify({
                selected: this.selected,
                type: this.selectedType,
                position: this.selectedPosition,
                bw: this.bw,
            }));
        },
        /**
         * Handle file input event
         * @param {Event} e file input event
         */
        handleFileInput(e) {
            if (!e.target.files) {
                return;
            }
            this.selectFile(e.target.files);
            e.target.value = '';
        },
        /**
         * Handle file drop event
         * @param {Event} e file drop event
         */
        handleFileDrop(e) {
            this.isDragOver = false;
            if (!e.dataTransfer.files) {
                return;
            }
            this.selectFile(e.dataTransfer.files);
        },
        /**
         * Select and filter a file
         * @param {array} list file list
         */
        async selectFile(list) {
            let isCustom = false;
            if (list.length > 1) {
                this.tooManyDialog = true;
                return;
            }
            if (list[0].size > 0 && list[0].name.match(/.(jpg|jpeg|png|gif|webp)$/i)) {
                if (list[0].type === '') {
                    // Check if it's a dir
                    try {
                        await list[0].slice(0, 1).arrayBuffer();
                    } catch (err) {
                        this.notImageDialog = true;
                        return;
                    }

                    // Disallow images larger than 10MB
                    if (list[0].size > 10485760) {
                        this.tooLargeDialog = true;
                        return;
                    }

                    // Clear previous custom image if persent
                    if (this.customURL !== '') {
                        URL.revokeObjectURL(this.customURL);
                    }

                    this.customURL = URL.createObjectURL(list[0]);
                    localForage.setItem('header_img', list[0]);
                    this.selectedType = 'custom';
                    this.selected = '';
                    isCustom = true;
                } else if (['image/gif', 'image/jpeg', 'image/png', 'image/webp'].includes(list[0].type)) {
                    // Disallow images larger than 10MB
                    if (list[0].size > 10485760) {
                        this.tooLargeDialog = true;
                        return;
                    }

                    // Clear previous custom image if persent
                    if (this.customURL !== '') {
                        URL.revokeObjectURL(this.customURL);
                    }

                    this.customURL = URL.createObjectURL(list[0]);
                    localForage.setItem('header_img', list[0]);
                    this.selectedType = 'custom';
                    this.selected = '';
                    isCustom = true;
                } else {
                    this.notImageDialog = true;
                    return;
                }
            } else {
                this.notImageDialog = true;
                return;
            }
            if (isCustom) {
                // Reset position
                this.selectedPosition = 50;
                this.sliderPosition = 50;
                this.store();
                this.$emit('change', {
                    image: this.customURL,
                    position: this.selectedPosition,
                });
            }
        },
        /**
         * Clear custom image
         * @param {boolean} clearBackground whether to clear background image from UI
         */
        clearCustom(clearBackground = true) {
            if (this.customURL !== '') {
                URL.revokeObjectURL(this.customURL);
            }
            this.customURL = '';
            localForage.removeItem('header_img');

            // Clear background
            if (clearBackground) {
                this.selectedPosition = 50;
                this.sliderPosition = 50;
                this.store();
                this.$emit('change', {
                    image: '',
                    position: this.selectedPosition,
                });
            }
        },
        /**
         * Update background image position
         * @param {number} val image position in percentage
         */
        updatePositon(val) {
            this.selectedPosition = val;
            this.$emit('change', {
                image: this.customURL,
                position: this.selectedPosition,
            });
        },
        /**
         * Toggle B&W mode
         */
        toggleBw(val) {
            this.$emit('bw', val);
            this.store();
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
    },
    async mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Restore background image info
        const data = JSON.parse(localStorage.getItem('header_bg') || '{"selected":"","type":"","position":50,"bw":false}');
        this.selected = data.selected;
        this.selectedType = data.type;
        this.selectedPosition = data.position;
        this.sliderPosition = data.position;
        this.bw = data.bw;

        // Set background image
        if (data.type === 'pre-defined') {
            if (this.selected !== '') {
                this.$emit('change', {
                    image: `https://cdn.jsdelivr.net/gh/uom-assistant/uoma-wallpapers/images/${this.selected}.jpg`,
                    position: this.selectedPosition,
                });
            }
        } else if (data.type === 'custom') {
            const blob = await localForage.getItem('header_img');
            this.customURL = URL.createObjectURL(blob);
            this.selected = '';
            this.$emit('change', {
                image: this.customURL,
                position: this.selectedPosition,
            });
        }

        // Set B&W mode
        this.$emit('bw', this.bw);

        this.loadImages();
    },
    beforeDestroy() {
        // Destroy background image from memory when unmount
        if (this.customURL !== '') {
            URL.revokeObjectURL(this.customURL);
        }
    },
};
</script>

<style lang="less" scoped>
.container {
    padding: 0;
    overflow: hidden;
    .main {
        padding: 20px;
        border-radius: 0;
        & /deep/ .v-input--selection-controls {
            margin-top: 0;
            padding: 0;
        }
        .loading {
            width: 100%;
            height: 200px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .bg-btn {
            background-size: cover;
            background-position: center;
            width: 120px;
            overflow: hidden;
            & /deep/ i {
                position: relative;
                z-index: 1;
                color: white!important;
            }
            &.bw {
                filter: grayscale(1);
            }
            &:after {
                content: '';
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: black;
                opacity: 0;
                position: absolute;
                z-index: 0;
                transition: opacity 0.2s;
            }
            &.selected:after {
                opacity: .6;
            }
        }
        .slider {
            width: 100px;
            margin-top: 2px;
        }
        .uploader {
            margin-top: 12px;
            width: 100%;
            height: 150px;
            border: rgba(136, 136, 136, .7) dashed 2px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            opacity: .7;
            transition: opacity .2s;
            cursor: pointer;
            user-select: none;
            position: relative;
            .uploader-bg {
                background-size: cover;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
                opacity: .15;
                &.bw {
                    filter: grayscale(1);
                }
            }
            & > i.v-icon, & > span {
                opacity: 1;
                transition: opacity .2s;
            }
            .drop-layer {
                position: absolute;
                display: flex;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: fade(#660099, 30%);
                z-index: 3;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                opacity: 0;
                transition: opacity .2s;
                user-select: none;
                & > i {
                    font-size: 80px!important;
                }
            }
            &.drag-over {
                * {
                    pointer-events: none;
                }
                & > i.v-icon, & > span {
                    opacity: .4;
                }
                .drop-layer {
                    opacity: 1;
                    pointer-events: auto;
                }
            }
            &:hover {
                opacity: 1;
            }
        }
    }
}
</style>

<style lang="less">
#app.theme--dark .personalise-container {
    .uploader {
        .drop-layer {
            background-color: fade(#D099E0, 30%);
        }
    }
}
</style>

<i18n>
{
    "en": {
        "customise": "Customise",
        "description": "Set a background image to personalise your dashboard.",
        "upload": "Click or drag & drop to select",
        "clear": "Clear",
        "Learning": "Learning",
        "Manchester": "Manchester",
        "Computer": "Computer",
        "Nature": "Nature",
        "Architecture": "Architecture",
        "Special": "Special",
        "position": "Position",
        "b&w": "Monochrome",
        "too_large": "Image too large",
        "too_large_body": "Unable to load images larger than 10MB.",
        "too_many": "Too many files",
        "too_many_body": "You can only choose one file at a time.",
        "not_a_image": "Not an image",
        "not_a_image_body": "The file you have selected is not an image.",
        "ok": "OK",
        "drop_file": "Drop your file here"
    },
    "zh": {
        "customise": "自定义",
        "description": "设置一张背景图像以个性化你的仪表板。",
        "upload": "点按或拖拽以选择图像",
        "clear": "清除",
        "Learning": "学习",
        "Manchester": "曼彻斯特",
        "Computer": "计算机",
        "Nature": "自然",
        "Architecture": "建筑",
        "Special": "特别呈现",
        "position": "位置",
        "b&w": "黑白",
        "too_large": "图片体积太大",
        "too_large_body": "无法载入大于 10MB 的图片。",
        "too_many": "太多文件了",
        "too_many_body": "一次只能选择一个文件。",
        "not_a_image": "不是图片",
        "not_a_image_body": "你选择的文件不是一张图片。",
        "ok": "好",
        "drop_file": "在此放下文件"
    },
    "es": {
        "customise": "Personalizar",
        "description": "Escoja una imagen de fondo para personalizar su tablero",
        "upload": "Haga clic o arrastre y suelte para seleccionar",
        "clear": "Limpiar",
        "Learning": "Estudio",
        "Manchester": "Manchester",
        "Computer": "Informática",
        "Nature": "Naturaleza",
        "Architecture": "Arquitectura",
        "Special": "Especial",
        "position": "Posición",
        "b&w": "Blanco&Negro",
        "too_large": "Imagen demasiado grande",
        "too_large_body": "No es posible subir imagenes mayor que 10MB",
        "too_many": "Demasiados archivos",
        "too_many_body": "Solo puede elegir un archivo cada vez",
        "not_a_image": "No es una imagen",
        "not_a_image_body": "El archivo seleccionado no es una imagen",
        "ok": "OK",
        "drop_file": "Suelte su archivo aquí"
    },
    "ja": {
        "customise": "カストマイズ",
        "description": "一つの背景画像を選択して、ダッシュボードをパーソナライズする。",
        "upload": "クリックやドラッグで画像を選択する",
        "clear": "クリア",
        "Learning": "学習",
        "Manchester": "マンチェスター",
        "Computer": "コンピューター",
        "Nature": "自然",
        "Architecture": "ビル",
        "Special": "特別",
        "position": "位置",
        "b&w": "白黒",
        "too_large": "画像サイズが大きすぎる",
        "too_large_body": "10MB以上の画像が読み込めません。",
        "too_many": "ファイルが多すぎる",
        "too_many_body": "一度に選択できるのは一つのファイルのみ。",
        "not_a_image": "画像ファイルではない",
        "not_a_image_body": "選択されたファイルは画像ではない。",
        "ok": "はい",
        "drop_file": "ここでファイルをドロップして"
    }
}
</i18n>
