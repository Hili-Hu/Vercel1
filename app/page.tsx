'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    setTodos([...todos, { id: Date.now(), text: input, done: false, priority, dueDate, category }]);
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

  const priorityColors = { high: 'destructive', medium: 'default', low: 'secondary' } as const;
  const categoryLabels = { work: '工作', life: '生活', study: '学习', other: '其他' };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">待办事项</h1>

      <Card>
        <CardHeader>
          <CardTitle>统计</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6 text-sm">
          <span>总计: {stats.total}</span>
          <span>已完成: {stats.done}</span>
          <span>待完成: {stats.pending}</span>
          <span>完成率: {stats.rate}%</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>添加任务</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="添加新任务..."
          />
          <div className="flex gap-3">
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">低优先级</SelectItem>
                <SelectItem value="medium">中优先级</SelectItem>
                <SelectItem value="high">高优先级</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">工作</SelectItem>
                <SelectItem value="life">生活</SelectItem>
                <SelectItem value="study">学习</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-40" />
            <Button onClick={addTodo}>添加</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>筛选</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索..." className="flex-1" />
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as Category | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              <SelectItem value="work">工作</SelectItem>
              <SelectItem value="life">生活</SelectItem>
              <SelectItem value="study">学习</SelectItem>
              <SelectItem value="other">其他</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部优先级</SelectItem>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="low">低</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((todo, index) => {
          const daysLeft = getDaysLeft(todo.dueDate);
          return (
            <Card
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
              className="cursor-move"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox checked={todo.done} onCheckedChange={() => toggleTodo(todo.id)} />
                {editingId === todo.id ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                    onBlur={() => saveEdit(todo.id)}
                    autoFocus
                    className="flex-1"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(todo)}
                    className={`flex-1 ${todo.done ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {todo.text}
                  </span>
                )}
                <Badge variant={priorityColors[todo.priority]}>{todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}</Badge>
                <Badge variant="outline">{categoryLabels[todo.category]}</Badge>
                {todo.dueDate && (
                  <Badge variant={daysLeft && daysLeft < 0 ? 'destructive' : 'secondary'}>
                    {daysLeft !== null && (daysLeft < 0 ? `逾期${-daysLeft}天` : daysLeft === 0 ? '今天' : `剩${daysLeft}天`)}
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={() => startEdit(todo)}>编辑</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteTodo(todo.id)}>删除</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
