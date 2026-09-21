'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
  MessageSquare,
  Power,
  Layers,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useSession } from '@/components/dashboard/session-provider';
import {
  DEFAULT_CHATBOT_CONFIG,
  DEFAULT_CHATBOT_RULES,
  evaluateChatbotRule,
  type ChatbotRule,
} from '@/lib/chatbot/rule-engine';

interface SimMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  ruleTitle?: string;
  isHandover?: boolean;
}

interface RuleFormData {
  title: string;
  keywords: string;
  action: 'none' | 'handover_human' | 'trigger_menu';
  response: string;
}

const INITIAL_FORM_DATA: RuleFormData = {
  title: '',
  keywords: '',
  action: 'none',
  response: '',
};

export function KeywordChatbot() {
  const { sessions, sessionId } = useSession();
  const currentSession = sessions.find((s) => s.sessionId === sessionId);
  const isLoggedOut = currentSession?.status === "LOGGED_OUT" || (sessions.length > 0 && sessions.every(s => s.status === "LOGGED_OUT"));

  const [rules, setRules] = useState<ChatbotRule[]>(DEFAULT_CHATBOT_RULES);
  const [enabled, setEnabled] = useState(true);
  const [autoReplyAnyWord, setAutoReplyAnyWord] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState(DEFAULT_CHATBOT_CONFIG.fallbackMessage);

  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<SimMessage[]>([]);
  const [isHandoverActive, setIsHandoverActive] = useState(false);

  // Dialog state for Add/Edit Rule
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ChatbotRule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>(INITIAL_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch rules on mount
  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      setIsLoadingRules(true);
      const res = await fetch('/api/chatbot/rules');
      const data = await res.json();
      if (data.success) {
        const loadedRules: ChatbotRule[] = Array.isArray(data.rules) && data.rules.length > 0
          ? data.rules
          : DEFAULT_CHATBOT_RULES;

        setRules(loadedRules);
        setEnabled(data.enabled ?? true);
        setAutoReplyAnyWord(data.autoReplyAnyWord ?? true);
        setFallbackMessage(data.fallbackMessage || DEFAULT_CHATBOT_CONFIG.fallbackMessage);

        const initialWelcome = data.fallbackMessage || loadedRules.find((r: ChatbotRule) => r.action === 'trigger_menu')?.response || DEFAULT_CHATBOT_CONFIG.fallbackMessage;
        setMessages([
          {
            id: 'welcome',
            sender: 'bot',
            text: initialWelcome,
            ruleTitle: 'Welcome & Options Menu',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
      toast.error('Failed to load chatbot configuration');
    } finally {
      setIsLoadingRules(false);
    }
  }

  async function handleSaveSettings(
    newEnabled = enabled,
    newAutoReply = autoReplyAnyWord,
    newFallback = fallbackMessage,
    currentRules = rules
  ) {
    if (newEnabled && isLoggedOut) {
      toast.error("Device is logged out", {
        description: "Cannot enable chatbot while the device is logged out. Please reconnect your account."
      });
      return;
    }
    try {
      setIsSavingSettings(true);
      const res = await fetch('/api/chatbot/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: newEnabled,
          autoReplyAnyWord: newAutoReply,
          fallbackMessage: newFallback,
          rules: currentRules,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setEnabled(data.enabled);
      setAutoReplyAnyWord(data.autoReplyAnyWord);
      setFallbackMessage(data.fallbackMessage);
      setRules(data.rules);
      toast.success('Chatbot configuration saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update chatbot settings');
    } finally {
      setIsSavingSettings(false);
    }
  }

  function handleOpenAddRule() {
    setEditingRule(null);
    setFormData(INITIAL_FORM_DATA);
    setFormError(null);
    setIsDialogOpen(true);
  }

  function handleOpenEditRule(rule: ChatbotRule) {
    setEditingRule(rule);
    setFormData({
      title: rule.title,
      keywords: rule.keywords.join(', '),
      action: rule.action || (rule.triggerHandover ? 'handover_human' : 'none'),
      response: rule.response,
    });
    setFormError(null);
    setIsDialogOpen(true);
  }

  async function handleSaveRule(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const title = formData.title.trim();
    const rawKeywords = formData.keywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    const response = formData.response.trim();

    if (!title) {
      setFormError('Rule title is required.');
      return;
    }

    if (rawKeywords.length === 0) {
      setFormError('At least one trigger keyword or number is required.');
      return;
    }

    if (!response) {
      setFormError('Bot response message is required.');
      return;
    }

    try {
      setIsSaving(true);
      let updatedRules: ChatbotRule[];

      if (editingRule) {
        updatedRules = rules.map((r) =>
          r.id === editingRule.id
            ? {
                ...r,
                title,
                keywords: rawKeywords,
                action: formData.action,
                triggerHandover: formData.action === 'handover_human',
                response,
              }
            : r
        );
      } else {
        const newRule: ChatbotRule = {
          id: `rule_${Date.now()}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 12)}`,
          title,
          keywords: rawKeywords,
          action: formData.action,
          triggerHandover: formData.action === 'handover_human',
          response,
        };
        updatedRules = [...rules, newRule];
      }

      await handleSaveSettings(enabled, autoReplyAnyWord, fallbackMessage, updatedRules);
      setIsDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (rules.length <= 1) {
      toast.error('You must retain at least one rule in the system.');
      return;
    }

    const ruleToDelete = rules.find((r) => r.id === ruleId);
    if (!confirm(`Are you sure you want to delete "${ruleToDelete?.title || 'this rule'}"?`)) {
      return;
    }

    try {
      setDeletingId(ruleId);
      const updatedRules = rules.filter((r) => r.id !== ruleId);
      await handleSaveSettings(enabled, autoReplyAnyWord, fallbackMessage, updatedRules);
    } catch (err) {
      console.error('Failed to delete rule:', err);
    } finally {
      setDeletingId(null);
    }
  }

  function handleSend(testInput?: string) {
    const textToSend = (testInput ?? inputText).trim();
    if (!textToSend) return;

    const userMsg: SimMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    const newMessages = [...messages, userMsg];

    if (!enabled) {
      const disabledMsg: SimMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ *Chatbot Disabled:* The master chatbot switch is turned OFF. No automated reply will be sent.',
        isHandover: true,
      };
      setMessages([...newMessages, disabledMsg]);
      setInputText('');
      return;
    }

    if (isHandoverActive) {
      const pausedBotMsg: SimMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '⏸️ *Bot Paused:* Conversation has been handed over to a human agent. Auto-replies are paused.',
        isHandover: true,
      };
      setMessages([...newMessages, pausedBotMsg]);
      setInputText('');
      return;
    }

    // Evaluate against current dynamic rules & fallback
    const evaluation = evaluateChatbotRule(
      textToSend,
      isHandoverActive,
      rules,
      autoReplyAnyWord,
      fallbackMessage
    );

    if (evaluation.matched && evaluation.response) {
      if (evaluation.isHandover) {
        setIsHandoverActive(true);
      }

      const botMsg: SimMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: evaluation.response,
        ruleTitle: evaluation.rule?.title || 'Trigger Matched',
        isHandover: evaluation.isHandover,
      };
      setMessages([...newMessages, botMsg]);
    }

    setInputText('');
  }

  function handleReset() {
    setIsHandoverActive(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: fallbackMessage || DEFAULT_CHATBOT_CONFIG.fallbackMessage,
        ruleTitle: 'Welcome & Options Menu',
      },
    ]);
    setInputText('');
  }

  return (
    <div className="space-y-6">
      {/* Master Controls Header Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  WhatsApp Auto-Responder & Chatbot
                  {enabled ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs gap-1">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      Active & Running
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-red-500/40 text-red-500 bg-red-500/10 text-xs">
                      Chatbot Paused
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Automate replies for all incoming WhatsApp messages instantly.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 shadow-2xs">
                <Label htmlFor="master-bot-switch" className="text-xs font-medium cursor-pointer">
                  {enabled ? 'Chatbot Enabled' : 'Chatbot Disabled'}
                </Label>
                <Switch
                  id="master-bot-switch"
                  checked={enabled}
                  onCheckedChange={(val) => {
                    if (val && isLoggedOut) {
                      toast.error("Device is logged out", {
                        description: "Cannot enable chatbot while the device is logged out. Please reconnect your account."
                      });
                      return;
                    }
                    setEnabled(val);
                    handleSaveSettings(val, autoReplyAnyWord, fallbackMessage, rules);
                  }}
                  disabled={isSavingSettings}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-1 pb-4">
          {isLoggedOut && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center justify-between">
              <span>⚠️ Device is logged out — WhatsApp chatbot cannot receive or respond to messages.</span>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4 pt-2">
            {/* Setting: Auto-reply to any incoming word */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border bg-background/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-semibold text-foreground">
                    Auto-Start on ANY Incoming Message
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  If someone texts any word or greeting (e.g. &quot;hi&quot;, &quot;vanakkam&quot;, &quot;details&quot;), immediately start the bot and show the menu.
                </p>
              </div>
              <Switch
                checked={autoReplyAnyWord}
                onCheckedChange={(val) => {
                  if (val && isLoggedOut) {
                    toast.error("Device is logged out", {
                      description: "Cannot enable auto-reply while the device is logged out."
                    });
                    return;
                  }
                  setAutoReplyAnyWord(val);
                  handleSaveSettings(enabled, val, fallbackMessage, rules);
                }}
                disabled={isSavingSettings || !enabled}
              />
            </div>

            {/* Custom Welcome Message Quick Trigger */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border bg-background/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold text-foreground">
                    Zero-Token Rule Engine
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Instant deterministic replies. Operates with 100% free multi-device WhatsApp gateway without AI costs.
                </p>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-mono text-[10px]">
                ⚡ 0.5s Latency
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Rules & Welcome Message Editor on Left, Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Welcome Message & Keyword Rules List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Default Welcome / Starter Menu Editor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Default Welcome & Starter Message
                  </CardTitle>
                  <CardDescription className="text-xs">
                    This message is automatically sent to any customer whenever they text any general phrase or greeting.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSaveSettings(enabled, autoReplyAnyWord, fallbackMessage, rules)}
                  disabled={isSavingSettings}
                  className="h-8 text-xs gap-1.5"
                >
                  {isSavingSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Message
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={fallbackMessage}
                onChange={(e) => setFallbackMessage(e.target.value)}
                className="text-xs font-mono leading-relaxed bg-muted/30 resize-y"
                placeholder="Enter your default welcome response..."
              />
            </CardContent>
          </Card>

          {/* Keyword Rules Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Custom Keyword Triggers
                  </CardTitle>
                  <CardDescription className="text-xs">
                    When customers reply with numbers or specific words (e.g. &quot;1&quot;, &quot;price&quot;, &quot;agent&quot;), the bot triggers these dedicated responses.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={handleOpenAddRule}
                  className="gap-1.5 h-8 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Trigger Rule
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {isLoadingRules ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs">Loading keyword rules...</span>
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground text-sm space-y-2">
                  <p>No keyword rules configured yet.</p>
                  <Button size="sm" variant="outline" onClick={handleOpenAddRule} className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add First Rule
                  </Button>
                </div>
              ) : (
                rules.map((rule: ChatbotRule) => (
                  <div
                    key={rule.id}
                    className="rounded-lg border border-border/80 bg-card p-3.5 transition-all hover:border-primary/40 hover:bg-muted/30 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {rule.action === 'trigger_menu' ? '★' : rule.keywords[0]?.toUpperCase().slice(0, 2) || '#'}
                        </span>
                        {rule.title}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {rule.action === 'handover_human' && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            Human Handover
                          </Badge>
                        )}
                        {rule.action === 'trigger_menu' && (
                          <Badge variant="secondary" className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400">
                            Menu
                          </Badge>
                        )}

                        <div className="flex items-center gap-1 ml-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditRule(rule)}
                            title="Edit rule"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteRule(rule.id)}
                            disabled={deletingId === rule.id}
                            title="Delete rule"
                          >
                            {deletingId === rule.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-muted-foreground font-medium">Triggers:</span>
                      {rule.keywords.map((kw) => (
                        <Badge
                          key={kw}
                          variant="outline"
                          className="text-[11px] font-mono bg-background text-foreground/80 py-0 cursor-pointer hover:bg-primary/10"
                          onClick={() => handleSend(kw)}
                          title="Click to test in simulator"
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-2 rounded bg-muted/60 p-2 text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                      {rule.response}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Interactive WhatsApp Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="flex flex-col h-[650px] shadow-sm">
            <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs">
                  WA
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Live Chatbot Simulator</CardTitle>
                  <CardDescription className="text-xs">
                    {isHandoverActive ? 'Handed over to human agent' : enabled ? 'Rule-Based Assistant online' : 'Chatbot paused'}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isHandoverActive && (
                  <Badge variant="destructive" className="text-[10px] h-5">
                    Paused
                  </Badge>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset} title="Reset Chat">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Chat message bubbles */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30 dark:bg-muted/10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-card border text-card-foreground rounded-bl-none'
                    }`}
                  >
                    {msg.ruleTitle && msg.sender === 'bot' && (
                      <div className="text-[10px] font-medium text-muted-foreground pb-1 mb-1 border-b border-border/50 flex items-center gap-1">
                        <span>Matched: {msg.ruleTitle}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-emerald-700 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>

            {/* Dynamic Quick Keyword Buttons from active rules */}
            <div className="px-3 py-2 border-t bg-card/60 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] text-muted-foreground shrink-0">Try:</span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2 shrink-0 bg-primary/5 text-primary"
                onClick={() => handleSend('hello bro')}
              >
                &quot;hello bro&quot; (Any Word)
              </Button>
              {rules.slice(0, 4).map((rule) => {
                const trigger = rule.keywords[0];
                if (!trigger) return null;
                return (
                  <Button
                    key={rule.id}
                    size="sm"
                    variant="outline"
                    className={`h-6 text-xs px-2 shrink-0 ${rule.action === 'handover_human' ? 'text-amber-600' : ''}`}
                    onClick={() => handleSend(trigger)}
                  >
                    {trigger}
                  </Button>
                );
              })}
            </div>

            {/* Input bar */}
            <div className="p-3 border-t bg-card flex gap-2">
              <Input
                placeholder={isHandoverActive ? 'Handover active. Type to test paused state...' : 'Type ANY word (e.g. hi, price, agent, good morning)...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="text-xs h-9"
              />
              <Button size="sm" className="h-9 px-3" onClick={() => handleSend()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add / Edit Rule Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveRule}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                {editingRule ? 'Edit Keyword Trigger' : 'Create New Keyword Trigger'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure instant auto-reply triggers and bot action behaviors.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="rule-title" className="text-xs font-medium">
                  Rule Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rule-title"
                  placeholder="e.g. Pricing, Demo, Support, Return Policy"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rule-keywords" className="text-xs font-medium">
                  Keywords / Numbers <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rule-keywords"
                  placeholder="Comma-separated: 1, price, pricing, cost"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="h-8 text-xs font-mono"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Separate multiple trigger terms with commas.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rule-action" className="text-xs font-medium">
                  Bot Action
                </Label>
                <select
                  id="rule-action"
                  value={formData.action}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      action: e.target.value as 'none' | 'handover_human' | 'trigger_menu',
                    })
                  }
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="none">Standard Auto-Reply</option>
                  <option value="handover_human">Handover to Human Agent (Pauses bot replies)</option>
                  <option value="trigger_menu">Navigation Menu</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rule-response" className="text-xs font-medium">
                  Bot Response Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="rule-response"
                  placeholder="Enter the WhatsApp response text (*bold*, _italic_ supported)"
                  value={formData.response}
                  onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                  className="min-h-24 text-xs font-mono leading-relaxed"
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="h-8 text-xs"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : editingRule ? (
                  'Save Changes'
                ) : (
                  'Create Rule'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
