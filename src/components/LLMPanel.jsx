import React, { useRef, useEffect, useState } from 'react'
import { Bot, Sparkles, Lightbulb, Zap, Layers, Filter, ArrowRight } from 'lucide-react'
import { LLMProcessingLoader, TypingLoader } from './LoadingStates'
import AnimatedTransition from './AnimatedTransition'

const LLMPanel = ({ processing, messages }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getStepIcon = (step) => {
    switch (step) {
      case '原始输入分析':
        return <Layers className="w-4 h-4 text-blue-600" />
      case '语境解读':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />
      case '概念化':
        return <Sparkles className="w-4 h-4 text-purple-600" />
      case '情感过滤':
        return <Filter className="w-4 h-4 text-red-600" />
      case '缺失信息检测':
        return <Zap className="w-4 h-4 text-orange-600" />
      default:
        return <Bot className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="flex items-center space-x-3">
          <div className="icon-container bg-gradient-to-br from-purple-500 to-indigo-600">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI 中介处理</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">智能分析和方案生成</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 space-y-4">
            <AnimatedTransition type="fade" show={true}>
              <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full shadow-inner">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </AnimatedTransition>
            <p className="text-lg">LLM中介将在这里处理您的请求</p>
            <div className="grid grid-cols-3 gap-4 mt-4 max-w-md">
              <AnimatedTransition type="slide-up" show={true} delay={100}>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-sm">
                  <Lightbulb className="w-6 h-6 mb-2 text-amber-500" />
                  <span>分析需求</span>
                </div>
              </AnimatedTransition>
              <AnimatedTransition type="slide-up" show={true} delay={200}>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-sm">
                  <Zap className="w-6 h-6 mb-2 text-blue-500" />
                  <span>生成方案</span>
                </div>
              </AnimatedTransition>
              <AnimatedTransition type="slide-up" show={true} delay={300}>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-sm">
                  <Layers className="w-6 h-6 mb-2 text-green-500" />
                  <span>优化结果</span>
                </div>
              </AnimatedTransition>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <AnimatedTransition key={index} type="slide-left" show={true}>
            <div className="message-bubble message-system">
              <div className="flex items-start space-x-2">
                <Bot className="w-4 h-4 text-secondary-700 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-secondary-800 mb-1">
                    {message.title}
                  </div>
                  
                  {message.steps && (
                    <div className="space-y-3 mt-2">
                      {message.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="bg-white rounded-md p-3 border border-secondary-100">
                          <div className="flex items-center space-x-2 mb-2 text-sm font-medium text-secondary-800">
                            {getStepIcon(step.name)}
                            <span>{step.name}</span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap pl-6">
                            {step.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.output && (
                    <div className="mt-3 bg-white rounded-md p-3 border border-secondary-100">
                      <div className="flex items-center space-x-2 mb-2 text-sm font-medium text-secondary-800">
                        <Zap className="w-4 h-4 text-secondary-600" />
                        <span>输出</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap pl-6">
                        {message.output}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-secondary-600 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedTransition>
        ))}
        
        {processing && (
          <AnimatedTransition type="fade" show={true}>
            <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
              <LLMProcessingLoader />
            </div>
          </AnimatedTransition>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </>
  )
}

export default LLMPanel