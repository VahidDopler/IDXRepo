exports.limitFieldOfDocObject = async (doc) => {
    return doc.lean().select("-id").lean().select("-_id").lean().select("-__v");
}
