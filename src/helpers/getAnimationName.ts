export function getAnimationName(filename: string) {
    if (filename.match(/(\w+)\.fbx/)) {
        return filename.match(/(\w+)\.fbx/)![1]
    } else {
        return filename
    }
}
