import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme/colors';
import { AdvisorChatApi, ConversationSummary } from '../../api/advisorChat';

type Msg = { id: string; role: 'user' | 'assistant'; content: string; local?: boolean };

const MAX_INPUT_CHARS = 15000;

const GREETING: Msg = {
  id: 'greeting',
  role: 'assistant',
  local: true,
  content:
    "Hi! I'm your OpportunityGenie advisor. Ask me anything about scholarships, fellowships, admissions, " +
    'conferences or application documents. You can also paste your statement of purpose or motivation letter ' +
    "and I'll give you feedback.\n\nI can make mistakes, so always confirm deadlines and requirements on the official site.",
};

const SUGGESTIONS: { label: string; send?: string; fill?: string }[] = [
  { label: 'Review my statement of purpose', fill: 'Please review my statement of purpose. Here it is:\n\n' },
  { label: 'Which scholarships fit me best?', send: 'Which scholarships fit my profile best, and why?' },
  { label: 'Scholarships without IELTS', send: 'Which scholarships can I apply for without IELTS?' },
  { label: 'What does "fully funded" cover?', send: 'What does "fully funded" really cover, and what should I check?' },
  { label: 'Help with my motivation letter', fill: 'Please help me improve my motivation letter. Here it is:\n\n' },
];

let idCounter = 0;
const uid = () => `m${Date.now()}_${idCounter++}`;

function friendlyError(e: any): { text: string; needsLogin: boolean } {
  const raw = String(e?.message ?? e ?? '').trim();
  if (/log ?in|unauthor|not authenticated|credentials|401/i.test(raw)) {
    return { text: 'Please log in to chat with the advisor.', needsLogin: true };
  }
  if (/network request failed|failed to fetch|timeout|timed out/i.test(raw)) {
    return { text: 'Check your internet connection and try again.', needsLogin: false };
  }
  if (raw && raw.length <= 200) return { text: raw, needsLogin: false };
  return { text: "Couldn't reach the advisor just now — try again in a moment.", needsLogin: false };
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Plain text with tappable links. */
function MessageText({ text, style, linkStyle }: { text: string; style: any; linkStyle: any }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <Text style={style} selectable>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const m = part.match(/^(.*?)([.,;:!?]*)$/);
          const url = m ? m[1] : part;
          const trail = m ? m[2] : '';
          return (
            <Text key={i}>
              <Text style={linkStyle} onPress={() => Linking.openURL(url)}>
                {url}
              </Text>
              {trail}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export default function AdvisorChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const initialConversationId: string | undefined = route.params?.conversationId;

  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [resumed, setResumed] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ text: string; needsLogin: boolean } | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const listRef = useRef<FlatList<Msg>>(null);
  const inputRef = useRef<TextInput>(null);
  const pendingRef = useRef('');

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Continue where the student left off: open the chat they pick, or else their most recent chat.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let id = initialConversationId;
        if (!id) {
          const list = await AdvisorChatApi.list();
          id = list[0]?.id;
        }
        if (id) {
          const detail = await AdvisorChatApi.get(id);
          if (!cancelled && detail.messages.length > 0) {
            setConversationId(detail.id);
            setMessages(detail.messages.map((m) => ({ id: `s${m.id}`, role: m.role, content: m.content })));
            setResumed(true);
          }
        }
      } catch {
        // Start a fresh chat; if the problem is login, the first message reports it.
      } finally {
        if (!cancelled) setLoadingChat(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialConversationId]);

  const resetChat = useCallback(() => {
    setMessages([GREETING]);
    setConversationId(undefined);
    setResumed(false);
    setError(null);
    setInput('');
  }, []);

  const openHistory = useCallback(() => {
    setView('history');
    setHistoryLoading(true);
    setHistoryError(false);
    AdvisorChatApi.list()
      .then((list) => setConversations(list))
      .catch(() => setHistoryError(true))
      .finally(() => setHistoryLoading(false));
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: view === 'history' ? 'Saved chats' : 'Advisor chat',
      headerRight: () => (
        <View style={styles.headerActions}>
          {view === 'history' ? (
            <Pressable hitSlop={8} onPress={() => setView('chat')}>
              <Text style={styles.headerAction}>Back to chat</Text>
            </Pressable>
          ) : (
            <>
              {!sending && (
                <Pressable hitSlop={8} onPress={openHistory}>
                  <Text style={styles.headerAction}>History</Text>
                </Pressable>
              )}
              {!sending && (messages.length > 1 || !!conversationId) && (
                <Pressable hitSlop={8} onPress={resetChat}>
                  <Text style={styles.headerAction}>New chat</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      ),
    });
  }, [navigation, view, sending, messages.length, conversationId, openHistory, resetChat]);

  const openConversation = async (id: string) => {
    setView('chat');
    setLoadingChat(true);
    setError(null);
    try {
      const detail = await AdvisorChatApi.get(id);
      setConversationId(detail.id);
      setMessages(
        detail.messages.length > 0
          ? detail.messages.map((m) => ({ id: `s${m.id}`, role: m.role, content: m.content }))
          : [GREETING],
      );
      setResumed(true);
    } catch {
      Alert.alert('Could not open this chat', 'Please try again.');
      setView('history');
    } finally {
      setLoadingChat(false);
    }
  };

  const confirmDelete = (c: ConversationSummary) => {
    Alert.alert('Delete this chat?', 'It will be removed from your saved chats and cannot be recovered.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AdvisorChatApi.remove(c.id);
            setConversations((cur) => cur.filter((x) => x.id !== c.id));
            if (c.id === conversationId) resetChat();
          } catch {
            Alert.alert('Could not delete this chat', 'Please try again.');
          }
        },
      },
    ]);
  };

  const request = useCallback(async (text: string, convId?: string) => {
    setSending(true);
    setError(null);
    pendingRef.current = text;
    try {
      const res = await AdvisorChatApi.send(text, convId);
      if (res.conversation_id) setConversationId(res.conversation_id);
      setMessages((cur) => [...cur, { id: uid(), role: 'assistant', content: res.text }]);
    } catch (e: any) {
      setError(friendlyError(e));
    } finally {
      setSending(false);
    }
  }, []);

  const send = (text: string) => {
    const content = text.trim();
    if (!content || sending) return;
    setMessages((cur) => [...cur, { id: uid(), role: 'user', content }]);
    setInput('');
    request(content, conversationId);
  };

  const onSuggestion = (s: { send?: string; fill?: string }) => {
    if (s.send) {
      send(s.send);
    } else if (s.fill) {
      setInput(s.fill);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const canSend = input.trim().length > 0 && !sending;
  const showSuggestions = messages.length === 1 && !sending;

  // ---------------- saved chats list ----------------
  if (view === 'history') {
    return (
      <View style={styles.container}>
        {historyLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.blue} />
          </View>
        ) : historyError ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Couldn't load your chats</Text>
            <Pressable style={styles.retryBtn} onPress={openHistory}>
              <Text style={styles.retryBtnText}>Try again</Text>
            </Pressable>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>No saved chats yet</Text>
            <Text style={styles.emptySub}>
              Your conversations with the advisor are saved here automatically, so you can come back to them later.
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <Pressable style={styles.convoCard} onPress={() => openConversation(item.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.convoTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!!item.preview && (
                    <Text style={styles.convoPreview} numberOfLines={2}>
                      {item.preview}
                    </Text>
                  )}
                  <Text style={styles.convoDate}>{formatWhen(item.updated_at)}</Text>
                </View>
                <Pressable
                  hitSlop={10}
                  onPress={() => confirmDelete(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete chat ${item.title}`}
                  style={styles.convoDelete}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.inkSoft} />
                </Pressable>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  }

  // ---------------- chat ----------------
  if (loadingChat) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Msg }) => {
    const mine = item.role === 'user';
    return (
      <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <MessageText
            text={item.content}
            style={[styles.bubbleText, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}
            linkStyle={mine ? styles.linkMine : styles.linkTheirs}
          />
        </View>
      </View>
    );
  };

  const header = resumed ? (
    <View style={styles.resumeBanner}>
      <Text style={styles.resumeText}>Continuing your saved chat</Text>
      <Pressable onPress={resetChat} hitSlop={8}>
        <Text style={styles.resumeLink}>Start a new chat</Text>
      </Pressable>
    </View>
  ) : null;

  const footer = (
    <View>
      {showSuggestions && (
        <View style={styles.chips}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s.label} style={styles.chip} onPress={() => onSuggestion(s)}>
              <Text style={styles.chipText}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {sending && (
        <View style={[styles.row, styles.rowTheirs]}>
          <View style={[styles.bubble, styles.bubbleTheirs, styles.typing]}>
            <ActivityIndicator size="small" color={colors.blue} />
            <Text style={styles.typingText}>Thinking…</Text>
          </View>
        </View>
      )}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error.text}</Text>
          <View style={styles.errorActions}>
            {error.needsLogin ? (
              <Pressable style={styles.errorBtn} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.errorBtnText}>Log in</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.errorBtn} onPress={() => request(pendingRef.current, conversationId)}>
                <Text style={styles.errorBtnText}>Try again</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={headerHeight}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputBar, { paddingBottom: keyboardOpen ? 8 : Math.max(insets.bottom, 8) }]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question or paste your text…"
          placeholderTextColor="#9AA3C7"
          multiline
          maxLength={MAX_INPUT_CHARS}
          cursorColor={colors.blue}
          selectionColor={colors.blue}
        />
        <Pressable
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={() => send(input)}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  headerAction: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.blue },
  listContent: { padding: 16, paddingBottom: 8 },
  resumeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.blueTint,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  resumeText: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft },
  resumeLink: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.blue },
  row: { flexDirection: 'row', marginBottom: 10 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '88%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: colors.blue, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 4 },
  bubbleText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: colors.ink },
  linkMine: { color: '#fff', textDecorationLine: 'underline' },
  linkTheirs: { color: colors.blue, textDecorationLine: 'underline' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 8 },
  chip: { backgroundColor: colors.blueTint, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  chipText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.blue },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft },
  errorBox: { backgroundColor: colors.redTint, borderRadius: 12, padding: 12, marginTop: 4, marginBottom: 6 },
  errorText: { fontFamily: fonts.regular, fontSize: 13, color: colors.red },
  errorActions: { flexDirection: 'row', marginTop: 8 },
  errorBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  errorBtnText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.red },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  input: {
    flex: 1,
    maxHeight: 140,
    minHeight: 42,
    backgroundColor: colors.grayTint,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  emptyTitle: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.ink, marginBottom: 6, textAlign: 'center' },
  emptySub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: 'center', lineHeight: 19 },
  retryBtn: { backgroundColor: colors.blue, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 22, marginTop: 14 },
  retryBtnText: { fontFamily: fonts.bold, fontSize: 13.5, color: '#fff' },
  convoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  convoTitle: { fontFamily: fonts.extraBold, fontSize: 14.5, color: colors.ink, marginBottom: 2 },
  convoPreview: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18 },
  convoDate: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 4 },
  convoDelete: { padding: 6 },
});
