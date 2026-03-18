'use client';

import { useState, useEffect } from 'react';

type Priority = 'high' | 'medium' | 'low';
type Category = 'work' | 'life' | 'study' | 'other';

type Todo = {
  id: number;
  text: string;
  done: boolean;
  priority: Priority;
  dueDate: string;
  category: Category;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, {
      id: Date.now(),
      text: input,
      done: false,
      priority,
      dueDate,
      category
    }]);
    setInput('');
    setDueDate('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: number) => {
    if (!editText.trim()) return;
    setTodos(todos.map(t => t.id === id ? { ...t, text: editText } : t));
    setEditingId(null);
  };

  const getDaysLeft = (date: string) => {
    if (!date) return null;
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filtered = todos.filter(t => {
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchCategory && matchPriority;
  });

  const stats = {
    total: todos.length,
    done: todos.filter(t => t.done).length,
    pending: todos.filter(t => !t.done).length,
    rate: todos.length ? Math.round((todos.filter(t => t.done).length / todos.length) * 100) : 0
  };

  const priorityColors = {
    high: '#ff4444',
    medium: '#ffaa00',
    low: '#44ff44'
  };

  const categoryLabels = {
    work: '工作',
    life: '生活',
    study: '学习',
    other: '其他'
  };

  return (
    <div style={{ maxWidth: 800, margin: '30px auto', padding: 20 }}>
      <h1>待办事项</h1>

      <div style={{ background: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
          <span>总计: {stats.total}</span>
          <span>已完成: {stats.done}</span>
          <span>待完成: {stats.pending}</span>
          <span>完成率: {stats.rate}%</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
          style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} style={{ padding: 8 }}>
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} style={{ padding: 8 }}>
            <option value="work">工作</option>
            <option value="life">生活</option>
            <option value="study">学习</option>
            <option value="other">其他</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ padding: 8 }}
          />
          <button onClick={addTodo} style={{ padding: '8px 20px', fontSize: 16 }}>添加</button>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索..."
          style={{ flex: 1, padding: 8 }}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as Category | 'all')} style={{ padding: 8 }}>
          <option value="all">全部分类</option>
          <option value="work">工作</option>
          <option value="life">生活</option>
          <option value="study">学习</option>
          <option value="other">其他</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')} style={{ padding: 8 }}>
          <option value="all">全部优先级</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map((todo, index) => {
          const daysLeft = getDaysLeft(todo.dueDate);
          return (
            <li
              key={todo.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('index', index.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('index'));
                const toIndex = index;
                const newTodos = [...todos];
                const [moved] = newTodos.splice(fromIndex, 1);
                newTodos.splice(toIndex, 0, moved);
                setTodos(newTodos);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                borderLeft: `4px solid ${priorityColors[todo.priority]}`,
                background: '#fff',
                marginBottom: 8,
                borderRadius: 4,
                cursor: 'move'
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              {editingId === todo.id ? (
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                  onBlur={() => saveEdit(todo.id)}
                  autoFocus
                  style={{ flex: 1, padding: 5 }}
                />
              ) : (
                <span
                  onDoubleClick={() => startEdit(todo)}
                  style={{
                    flex: 1,
                    textDecoration: todo.done ? 'line-through' : 'none',
                    color: todo.done ? '#999' : '#000'
                  }}
                >
                  {todo.text}
                </span>
              )}
              <span style={{ fontSize: 12, color: '#666' }}>{categoryLabels[todo.category]}</span>
              {todo.dueDate && (
                <span style={{ fontSize: 12, color: daysLeft && daysLeft < 0 ? 'red' : '#666' }}>
                  {daysLeft !== null && (daysLeft < 0 ? `逾期${-daysLeft}天` : daysLeft === 0 ? '今天' : `剩${daysLeft}天`)}
                </span>
              )}
              <button onClick={() => startEdit(todo)} style={{ padding: '5px 10px' }}>编辑</button>
              <button onClick={() => deleteTodo(todo.id)} style={{ padding: '5px 10px' }}>删除</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
