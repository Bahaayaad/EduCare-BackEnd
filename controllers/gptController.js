const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey:"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"
})

module.exports.gptChat = async(req, res) =>{
    const response = await openai.chat.completions.create({
        model:'gpt-4-turbo-preview',
        messages:[{'role':'user', 'content':'generate questions on the following material'}],
        max_tokens:100
    })

}