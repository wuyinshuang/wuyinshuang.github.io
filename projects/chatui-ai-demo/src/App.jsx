import React from 'react';
import Chat, { Bubble, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';

const aiAvatar = `${import.meta.env.BASE_URL}boncfc_logo.png`;
const userAvatar = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect width="60" height="60" rx="8" fill="#E8E8E8"/><circle cx="30" cy="24" r="12" fill="#999"/><path d="M12 52c0-10 8-18 18-18s18 8 18 18" fill="#999"/></svg>');

const suggestionItems = [
  '客户产品智能推荐',
  '客户定价个性化定制',
  '产品收益与风险模拟',
  '实际数据回溯与调优',
];

const initialMessages = [
  {
    type: 'text',
    content: { text: '你好！我是鑫智策 AI 助手，有什么可以帮助你的吗？' },
    position: 'left',
    user: { avatar: aiAvatar },
  },
  {
    type: 'suggestion',
    content: { items: suggestionItems },
    position: 'left',
  },
];

export default function App() {
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);

  function handleSend(type, val) {
    if (type !== 'text' || !val.trim()) return;

    appendMsg({
      type: 'text',
      content: { text: val },
      position: 'right',
      user: { avatar: userAvatar },
    });

    setTyping(true);

    setTimeout(() => {
      appendMsg({
        type: 'text',
        content: {
          text: `我收到了你的消息：「${val}」。这是一个模拟回复，后续可以对接真实的 AI 接口。`,
        },
        position: 'left',
        user: { avatar: aiAvatar },
      });
      setTyping(false);
    }, 1000);
  }

  function renderMessageContent(msg) {
    const { type, content } = msg;
    if (type === 'suggestion') {
      return (
        <div className="suggestion-box">
          <p className="suggestion-title">猜你想问</p>
          <div className="suggestion-list">
            {content.items.map((item, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSend('text', item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return <Bubble content={content.text} />;
  }

  return (
    <Chat
      navbar={{ title: '鑫智策 AI 助手' }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
      placeholder={'请输入消息...'}
    />
  );
}
