// 魔搭LLM处理服务
// 使用魔搭平台的Qwen2.5-7B-Instruct模型

// 魔搭API配置
const MODELSCOPE_CONFIG = {
  baseURL: 'https://api-inference.modelscope.cn/v1',
  model: 'Qwen/Qwen2.5-7B-Instruct',
  apiKey: 'ms-150d583e-ed00-46d3-ab35-570f03555599'
}

// 调用魔搭API的通用函数
const callModelScopeAPI = async (messages, temperature = 0.7) => {
  try {
    const response = await fetch(`${MODELSCOPE_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODELSCOPE_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: MODELSCOPE_CONFIG.model,
        messages: messages,
        temperature: temperature,
        max_tokens: 2000,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('魔搭API调用错误:', error)
    throw error
  }
}

// 统一清理输出文本，移除影响体验的模板化致歉或引导语
const sanitizeOutput = (text) => {
  if (!text) return text
  const bannedPhrases = [
    '非常抱歉',
    '抱歉',
    '我未能理解',
    '请您详细描述',
    '请提供更多信息',
    '信息不足',
    '若有不符请指正',
    '你好！很高兴能帮助你。',
    '请问你现在是在寻找什么类型的商品',
    '衣服、鞋子还是其他什么小物件'
  ]
  let sanitized = text
  bannedPhrases.forEach((p) => {
    const regex = new RegExp(p, 'g')
    sanitized = sanitized.replace(regex, '')
  })
  return sanitized.trim()
}

// 处理问题端输入
const processProblemInput = async (content, image, scenario) => {
  try {
    // 根据场景定制提示词
    const scenarioPrompts = {
      retail: {
        systemRole: '你是一个专业的零售需求分析专家，专门处理顾客与门店之间的沟通。',
        context: '场景边界：仅限零售顾客-门店沟通。禁止输出任何企业内部流程/跨部门协作/技术研发等企业场景内容。\n在零售场景中，顾客通常关注产品功能、价格、服务质量等。请将顾客的需求转化为门店能够理解和执行的专业描述，必须包含具体的产品类型、使用场景、预算范围、尺寸要求等关键信息。',
        example: '例如："我需要一件适合商务场合的衣服" → "顾客需要商务正装西装，男性/女性，用于重要会议场合，预算500-1000元，需要专业搭配建议和合身尺码推荐"'
      },
      enterprise: {
        systemRole: '你是一个专业的企业沟通分析专家，专门处理跨部门协作需求。',
        context: '场景边界：仅限企业内部跨部门沟通。禁止输出任何与商品销售、衣服/鞋子/价格/购买等零售相关的内容，如出现倾向须改写为企业语境表述。\n在企业场景中，不同部门有各自的专业术语和工作重点。请将市场部的需求转化为研发部能够理解的技术要求，必须包含具体的功能目标、技术需求、时间期限、资源投入等关键信息。',
        example: '例如："我们需要提升用户体验" → "市场部要求开发移动端界面优化功能，目标提升用户留存率15%，需要UI/UX重设计和前端开发，预期3个月内完成"'
      },
      education: {
        systemRole: '你是一个专业的教育沟通分析专家，专门处理师生互动需求。',
        context: '场景边界：仅限师生互动的学习沟通。禁止输出企业/零售等非教学场景内容。\n在教育场景中，学生的问题往往需要转化为教师能够系统回答的教学要点。请将学生的疑问转化为清晰的学习需求，必须包含具体的知识点、理解困难、学习目标、所需教学方式等关键信息。',
        example: '例如："我不懂这个概念" → "学生对量子物理波粒二象性概念理解困难，需要通过具体实验例子和图解说明，目标是掌握基本原理和应用场景"'
      }
    }

    if (!scenario || !scenarioPrompts[scenario]) {
      throw new Error(`无效的场景类型: ${scenario}。支持的场景: ${Object.keys(scenarioPrompts).join(', ')}`)
    }
    const prompt = scenarioPrompts[scenario]
    
    const comprehensivePrompt = [
      {
        role: 'system',
        content: `${prompt.systemRole}\n\n${prompt.context}\n\n${prompt.example}\n\n严格规则：
1. 只基于用户提供的信息进行表达，禁止编造任何未出现的具体事实（价格/时间/数量/规格等）。
2. 禁止使用模糊或拒绝类模板语，如“非常抱歉/无法理解/请提供更多信息/若有不符请指正”等。
3. 输出需清晰、克制、专业，面向对方直接可读，避免冗长的自我解释。
4. 若信息不足，采用“待确认信息”列表列出需要澄清的2-5项，而不是要求用户补充或致歉。
5. 优先保持可执行性和用户体验。`
      },
      {
        role: 'user',
        content: `用户输入："${content}"${image ? '\n（用户还上传了一张图片）' : ''}\n\n请用“自然沟通对话”的口吻，直接面向对方（方案端）说话，表达简洁、礼貌、具体、可执行；不要使用列表或结构化标题，不要出现“非常抱歉/请提供更多信息/若有不符请指正”等模板语；若确有需要澄清的点，请以自然语言在一句话内温和提出（不使用项目符号）。`
      }
    ]
    const resultRaw = await callModelScopeAPI(comprehensivePrompt, 0.1)
    const result = sanitizeOutput(resultRaw)

    // 简化的步骤显示
    const steps = [
      {
        name: '语义翻译',
        content: result
      }
    ]

    return {
      steps,
      translatedMessage: result
    }
  } catch (error) {
    console.error('处理问题输入时出错:', error)
    throw error
  }
}

// 处理方案端响应
const processSolutionResponse = async (content, scenario) => {
  try {
    // 根据场景定制提示词
    const scenarioPrompts = {
      retail: {
        systemRole: '你是一个专业的零售方案优化专家，专门将门店的专业回复转化为顾客易懂的语言。',
        context: '在零售场景中，门店回复通常包含专业术语和详细信息。请将其转化为顾客友好、易懂的表达方式，必须包含具体的产品信息、价格、购买建议和服务细节。',
        example: '例如："该款商务套装采用高支棉面料，版型修身" → "这套西装使用优质棉料制作，剪裁合身显身材，售价1200元，包含免费修改服务，适合您的商务会议需求"'
      },
      enterprise: {
        systemRole: '你是一个专业的企业方案优化专家，专门将技术回复转化为业务语言。',
        context: '在企业场景中，研发部的回复通常包含技术细节。请将其转化为市场部能够理解的业务价值表达，必须包含具体的实施方案、时间安排、预期效果和资源需求。',
        example: '例如："我们将优化API响应时间和数据库查询效率" → "我们将在2个月内完成系统优化，预计用户操作速度提升50%，需要3名开发人员，预算约30万元"'
      },
      education: {
        systemRole: '你是一个专业的教育方案优化专家，专门将教师的专业回复转化为学生易懂的语言。',
        context: '在教育场景中，教师的回复通常包含专业知识点。请将其转化为学生容易理解和记忆的表达方式，必须包含具体的概念解释、实例说明、学习方法和练习建议。',
        example: '例如："量子力学中波粒二象性是指微观粒子既具有波动性又具有粒子性" → "波粒二象性简单说就是光既像波浪又像小球，比如光的干涉现象显示波动性，光电效应显示粒子性，你可以通过做双缝实验来理解这个概念"'
      }
    }

    if (!scenario || !scenarioPrompts[scenario]) {
      throw new Error(`无效的场景类型: ${scenario}。支持的场景: ${Object.keys(scenarioPrompts).join(', ')}`)
    }
    const prompt = scenarioPrompts[scenario]
    
    const comprehensivePrompt = [
      {
        role: 'system',
        content: `${prompt.systemRole}\n\n${prompt.context}\n\n${prompt.example}\n\n严格规则：
1. 只基于方案端提供的信息进行表述，禁止编造未出现的指标/价格/时间等具体事实。
2. 禁止使用模糊或拒绝类模板语（如“非常抱歉/无法理解/请提供更多信息/若有不符请指正”等）。
3. 输出面向最终用户，简洁、友好、具体，避免冗长解释。
4. 若信息不足，使用“待确认信息”列表给出2-5条需要澄清的问题；若无则写“无”。
5. 优先保证可执行性与用户体验。`
      },
      {
        role: 'user',
        content: `方案端响应："${content}"\n\n请用“自然沟通对话”的口吻，直接面向用户说话，表达友好、具体、可执行；不要使用列表或结构化标题，不要出现“非常抱歉/请提供更多信息/若有不符请指正”等模板语；若存在待确认事项，请在一句话里温和地邀请用户确认关键点，并给出明确的下一步建议（仅基于已知信息）。`
      }
    ]
    const resultRaw = await callModelScopeAPI(comprehensivePrompt, 0.1)
    const result = sanitizeOutput(resultRaw)

    // 简化的步骤显示
    const steps = [
      {
        name: '方案优化',
        content: result
      }
    ]

    return {
       steps,
       optimizedMessage: result
     }
  } catch (error) {
    console.error('处理方案响应时出错:', error)
    throw error
  }
}



// 辅助函数 - 保留用于向后兼容
const analyzeContext = async (content) => {
  const prompt = [
    {
      role: 'system',
      content: '你是一个语境分析专家，请分析用户输入的业务场景和上下文。'
    },
    {
      role: 'user',
      content: `用户输入："${content}"\n\n请分析这个输入可能涉及的业务场景、行业背景或使用环境。`
    }
  ]
  return await callModelScopeAPI(prompt)
}

const conceptualize = async (content) => {
  const prompt = [
    {
      role: 'system',
      content: '你是一个概念设计师，请将用户需求转化为具体的概念和功能点。'
    },
    {
      role: 'user',
      content: `基于用户输入："${content}"\n\n请将其概念化为具体的功能需求或解决方案要点。`
    }
  ]
  return await callModelScopeAPI(prompt)
}

const detectMissingInfo = async (content) => {
  const prompt = [
    {
      role: 'system',
      content: '你是一个需求完整性检查专家，请识别用户输入中可能缺失的关键信息。'
    },
    {
      role: 'user',
      content: `用户输入："${content}"\n\n请识别为了更好地理解和满足用户需求，还需要哪些额外信息？`
    }
  ]
  return await callModelScopeAPI(prompt)
}

const translateToSolution = async (content) => {
  const prompt = [
    {
      role: 'system',
      content: '你是一个需求翻译专家，请将用户的原始输入转化为清晰、专业的需求描述。'
    },
    {
      role: 'user',
      content: `用户原始输入："${content}"\n\n请将其转化为清晰、专业的需求描述，包含具体的功能要求和期望结果。`
    }
  ]
  return await callModelScopeAPI(prompt)
}

const optimizeForUser = async (content) => {
  const prompt = [
    {
      role: 'system',
      content: '你是一个用户体验专家，请将技术方案转化为用户易懂的语言，并提供清晰的行动指南。'
    },
    {
      role: 'user',
      content: `技术方案："${content}"\n\n请将其转化为用户友好的语言，包含清晰的步骤和预期结果。`
    }
  ]
  return await callModelScopeAPI(prompt)
}

// 主要的LLM处理函数
export const processWithLLM = async ({ type, content, image, context, scenario }) => {
  try {
    if (type === 'problem_input') {
      return await processProblemInput(content, image, scenario)
    } else if (type === 'solution_response') {
      return await processSolutionResponse(content, scenario)
    }
    
    throw new Error('未知的处理类型')
  } catch (error) {
    console.error('LLM处理错误:', error)
    throw error
  }
}

// 导出其他可能需要的函数
export {
  callModelScopeAPI,
  analyzeContext,
  conceptualize,
  detectMissingInfo,
  translateToSolution,
  optimizeForUser
}