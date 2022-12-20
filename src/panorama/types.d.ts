interface PanoramaImage {
    id: string | number
    text?: string
    src: string
    type?: 'equirectangular' | 'cube'
}
