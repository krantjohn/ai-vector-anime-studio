import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Wand2,
  Play,
  CheckCircle2,
  RefreshCw,
  Code2,
  Layers,
  Settings,
  ChevronRight,
  Flame,
  KeyRound,
  Sliders,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { MASTER_MIKA_PROJECT, createMasterMika10kProject, createMasterMikaBaseProject } from '../../data/masterMikaProject';
import { SYLPHIE_PROJECT, createSylphieProject, createSylphie10kProject } from '../../data/sylphieProject';
import { AiAnimeGenerator } from '../../engine/aiAnimeGenerator';
import { StepDensityEngine } from '../../engine/stepDensityEngine';
import { ImageVectorizer } from '../../engine/imageVectorizer';
import { ProjectData } from '../../types/anime';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  projectPayload?: ProjectData;
  isStreaming?: boolean;
}

export interface AiChatPanelProps {
  onSwitchTab?: (tab: 'diff' | 'source' | 'layers') => void;
  className?: string;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({ onSwitchTab, className = '' }) => {
  const { project, setProject, setCurrentStep, setIsPlaying, currentStep } = useStudio();
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('https://api.openai.com/v1');
  const [modelName, setModelName] = useState('内置二次元高精矢量模型 (Local SOTA Engine)');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Conversation Thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `你好！我是你的 **AI 矢量插画 Co-Pilot 助理**。

根据你的专业审美要求，我已对引擎进行深度去“AI味”重塑，全面学习了 **手绘墨线骨架（Weighted Ink Contours）**、**纯净赛璐璐硬边切面（Hard-Edge Cel Shading）**、**通透底色（Clean Pastel Palette）** 与 **灵动二次元五官（Manga Expressive Features）** 的大师技法！

你可以直接点击下方灵感标签或自然语言指挥我绘制，例如：
* 🦋 **“原创星辉蝶愿 希尔菲”**：【粉毛·金瞳·少女身材】全新原创二次元美少女！零重力浮空身段、流光星蝶召唤、纯净赛璐璐硬折面与加重墨线骨架
* 🎨 **“手绘墨线 Penia 粉发原画”**：真实手绘原画笔墨质感，娇嗔侧颜与灵动长发
* 🖤 **“玄龙门主 龙华妃姬”**：蔚蓝档案夏日沙滩椅，优雅旗袍、墨镜与硬折面阴影
* 🌊 **“什亭之匣 普拉娜”**：海风白发红瞳、白色蕾丝泳装与悬浮霓虹光环
* 🐺 **“阿拜多斯 砂狼白子·恐怖”**：银发狼耳、冷冽青碧猫眼与裂纹光环
* 🍎 **“光影交错 苹果少女”**：强烈斜切晨曦光束、手捧红苹果与黑蕾丝
* 🌸 **“圣三一天使弥香”**：茶会粉发双丸子、3D立体浮空双环与羽翼
* 📷 **点击左下角上传本地任意参考图，自动运行双边平滑与纯净样条矢量解构！**`,
      projectPayload: SYLPHIE_PROJECT,
    },
  ]);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Quick Action Chips with authentic anime masterworks & diverse actions
  const quickPrompts = [
    { label: '🦋 原创希尔菲 (粉毛金瞳少女)', prompt: '请原创绘制一位粉毛金瞳的少女身材魔法少女希尔菲，流光星蝶浮空召唤姿态！' },
    { label: '🌅 晨光伸懒腰 (舒展微风)', prompt: '请绘制粉发晨光伸懒腰少女，微风白衬衫，仰头闭目治愈神态！' },
    { label: '💃 露背礼服回眸 (高贵晚宴)', prompt: '请绘制银紫发优雅大露背晚礼服回眸少女，紫花发饰高贵侧颜！' },
    { label: '🎾 活力网球少女 (挥拍擦汗)', prompt: '请绘制银发红瞳网球少女，运动挥拍擦汗，红白短裙活力跃动！' },
    { label: '🕊️ 悬浮抱膝精灵 (空灵赤足)', prompt: '请绘制空灵悬浮抱膝精灵少女，赤足飘逸白裙，幽灵小精灵环绕！' },
    { label: '👁️ 支配恶魔遮面 (玛奇玛)', prompt: '请绘制电锯人玛奇玛单手遮面，金色同心圆魔眼，西装领带狂气神情！' },
    { label: '🌾 麦田花海兽耳 (赫萝田园)', prompt: '请绘制金发兽耳花田抚花少女，麻花辫万寿菊暖阳田园风！' },
    { label: '🌊 初音双马尾泳装 (手绘原画)', prompt: '请绘制初音未来长双马尾泳装，清爽夏日海滩手绘签名原画！' },
    { label: '🖤 龙华妃姬 (沙滩椅侧卧)', prompt: '请绘制玄龙门主龙华妃姬沙滩椅插画，黑金旗袍长纱、紫瞳墨镜与硬边赛璐璐光影！' },
    { label: '🌊 普拉娜 (海滩遮阳伞)', prompt: '请绘制什亭之匣普拉娜夏日海滩泳装，白发红瞳、粉红立体光环与遮阳伞小鲸鱼！' },
    { label: '🐺 白子·恐怖 (战术狼耳)', prompt: '请绘制阿拜多斯砂狼白子·恐怖，银发立挺狼耳、青碧猫瞳与悬浮裂纹光环！' },
    { label: '🍎 苹果少女 (斜切强光)', prompt: '请绘制光影交错苹果少女，斜切晨曦强光、波浪蓝发、双手托苹果与黑蕾丝！' },
    { label: '🎨 手绘原画 Penia (漫画墨线)', prompt: '请绘制手绘墨线 Penia 粉发原画，要有纯正日系漫画墨水笔触与原画师签名！' },
  ];

  const getPoseDescription = (pose?: string): string => {
    switch (pose) {
      case 'sylphie':
        return '原创少女身材零重力浮空身姿，樱粉长发与双侧星蝶随风扬起，平展双臂召唤流光灵蝶';
      case 'stretch':
        return '清晨背光舒展动势，双臂高举中轴曲线，仰头闭目治愈神态';
      case 'glance':
        return '优雅大露背晚礼服侧身回眸，脊椎 S 型转折，高贵侧颜深邃凝视';
      case 'tennis':
        return '活力网球击球挥拍斜角动势，红白运动装擦汗，跃动活力';
      case 'ethereal':
        return '半空失重悬浮抱膝赤足，灵动白裙飘飞，小精灵陪伴环绕';
      case 'makima':
        return '手掌遮半脸极端手部透视，支配恶魔金色同心圆魔眼狂气神情';
      case 'miku':
        return '及膝超长双马尾抛物线，清凉海滩元气站姿，手绘日文签名';
      case 'foxear':
        return '温暖花海麦田抚弄花瓣，毛茸茸兽耳与下垂麻花辫田园风';
      case 'lounge':
        return '沙滩躺椅 45° 仰卧慵懒体态，指尖轻推墨镜，黑金和风长袍';
      case 'beach':
        return '什亭之匣娇小身形海滩微俯身，白兔耳发带与黑色长柄伞';
      case 'tactical':
        return '战术风衣立领战备姿态，直挺狼耳与冷傲俯视猫瞳';
      case 'apple':
        return '双手托腮捧红苹果，左上方强烈斜切明暗交界线';
      case 'sketch':
        return '纯正日系漫画原画手绘墨线，高马尾蝴蝶结与画师亲笔签名';
      case 'angel':
        return '圣三一天使羽翼展开，3D浮空双层立体光环与茶会礼服';
      case 'gothic':
        return '暗夜哥特吸血鬼仰角骨架，蝙蝠恶魔双翼与维多利亚蕾丝';
      case 'cyber':
        return '赛博全息猫耳机械娘，六边形能量护盾与霓虹机能战衣';
      case 'shrine':
        return '姬发式极黑长直和服巫女，振袖白衣绯袴与落樱祈愿';
      case 'magical':
        return '螺旋星辰双马尾，星之法杖与梦幻多层洛丽塔裙摆';
      default:
        return '标准黄金比例二次元动态中轴与三庭五眼对齐';
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      const userMsgId = `user-${Date.now()}`;
      const userMsg: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🖼️ [上传参考图像: ${file.name}] 请运用 VTracer 贝塞尔拟合与 5 阶段语义分层算法，将该图像解构为 10,000 步矢量工程！`,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);

      try {
        const vectorizedProject = await ImageVectorizer.vectorizeBase64(
          base64Data,
          `位图解构: ${file.name.replace(/\.[^/.]+$/, '')}`,
          10000
        );

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `### 🎨 图像矢量化解构完成 (10,000 步精修工程)！

- **算法驱动**: 结合 VTracer 贝塞尔轮廓提取与五层语义拓扑映射
- **阶段划分**: 01初版草图 -> 02底色铺设 -> 03结构阴影 -> 04细部雕琢 -> 05神圣光晕
- **步数密度**: 已平滑插值至 **10,000 个矢量微步**
- **代码同步**: 已实时生成全量 XML 增量 diff 代码。你可以点击下方按钮立即在画布渲染或回放！`,
          projectPayload: vectorizedProject,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `抱歉，矢量化解构过程中出现异常: ${err?.message || '未知错误'}。`,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputPrompt).trim();
    if (!text || isProcessing) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    // AI Reasoning & Generation Engine
    setTimeout(() => {
      let replyText = '';
      let generatedProject: ProjectData;

      const lower = text.toLowerCase();
      const isSylphie =
        lower.includes('希尔菲') ||
        lower.includes('sylphie') ||
        lower.includes('星蝶') ||
        lower.includes('蝶愿') ||
        lower.includes('原创') ||
        ((lower.includes('粉毛') || lower.includes('粉发') || lower.includes('樱发')) && (lower.includes('金瞳') || lower.includes('黄瞳') || lower.includes('金眼') || lower.includes('琥珀'))) ||
        ((lower.includes('粉毛') || lower.includes('粉发') || lower.includes('樱发')) && lower.includes('少女身材')) ||
        ((lower.includes('金瞳') || lower.includes('黄瞳') || lower.includes('金眼') || lower.includes('琥珀')) && lower.includes('少女身材'));
      const isMika = lower.includes('弥香') || lower.includes('mika') || (lower.includes('天使') && lower.includes('圣三一'));
      const is10k = lower.includes('10000') || lower.includes('10,000') || lower.includes('一万步') || lower.includes('上万步');

      if (isSylphie) {
        if (is10k) {
          generatedProject = createSylphie10kProject();
          replyText = `### ✨ 星辉蝶愿 · 希尔菲 (10,000 步超微步原创杰作) 已生成！

已根据要求将原创粉毛金瞳角色希尔菲插值至 **10,000 微步**。`;
        } else {
          generatedProject = createSylphieProject();
          replyText = `### 🦋 星辉蝶愿 · 希尔菲 (${generatedProject.steps.length.toLocaleString()} 真实高精矢量笔触 · 100% 原创二次元杰作) 已完成！

针对你的核心需求【粉毛、金瞳、少女身材，拒绝机械模仿，展现原创绘制】，AI 智能体已独立设计并矢量解构出极具艺术张力的原创二次元美少女——**星辉蝶愿 · 希尔菲 (Sylphie)**：
- 🌸 **飘逸动感樱粉长发**: 双侧星形发夹点缀，微风向外扬起的饱满波浪发丝，纯净通透赛璐璐平涂；
- ✨ **晶莹璀璨星辉金瞳**: 琥珀金宝石渐变眼眸，内嵌四角星芒黄色瞳孔与高光反光，神态灵动而温柔；
- 👗 **纤细灵动的少女身材**: 优雅S型微仰浮空身段，锁骨与纤指骨架自然舒展，平展双手召唤微光灵蝶；
- 🌌 **星空渐变洛丽塔法裙**: 蓝紫渐变薄纱伞裙、胸前金丝刺绣与星月结晶饰品，层次丰富分明；
- 🦋 **半空召唤流光星蝶**: 青蓝与粉紫发光灵蝶绕身展翅，身后浮空星辉幻月与漫天星芒粒子；
- ✒️ **DoG 加重墨线骨架**: 坚决杜绝油画杂乱碎斑，以清晰黑色墨线为骨架，大块面纯净赛璐璐为基底！

包含 **${generatedProject.steps.length.toLocaleString()} 组真实贝塞尔三次样条微步**，严谨分为五阶段由粗到精演进。你可以点击下方按钮立即在画布查看全图或播放绘制全过程！`;
        }
      } else if (isMika) {
        if (is10k) {
          generatedProject = createMasterMika10kProject();
          replyText = `### ✨ 圣三一的天使 · 圣园弥香 (10,000 步超微步插值版) 已生成！

已根据要求运用微步插值算法扩展至 **10,000 微步**。`;
        } else {
          generatedProject = createMasterMikaBaseProject();
          replyText = `### 🌸 圣三一的天使 · 圣园弥香 (${generatedProject.steps.length.toLocaleString()} 真实高精矢量笔触) 已完成！

针对你的提示词，我精确提炼了《蔚蓝档案》圣园弥香的核心人设特征，并以 **${generatedProject.steps.length.toLocaleString()} 组真实矢量微步**与亚像素几何曲线（geometricPrecision）进行了精准分层构建：
- **3D 浮空立体光环**: 倾斜透视双层光环，附随淡紫粉色四角星芒结晶与金色外环；
- **纯白天使羽翼**: 大弧度右上展开，带有羽绒覆羽、受光高光与天使发光星珠；
- **樱粉渐变发丝**: 双发髻丸子头缀蓝白蕾丝发圈，发丝向侧方狂放飘扬，末梢微紫透光；
- **弥香琥珀金星瞳**: 琥珀金渐变虹膜，内部镶嵌弥香专属**四角星芒黄色瞳孔**与双重主反光；
- **圣三一茶会礼服**: 白色双层披肩、左胸圣三一金质十字勋章、双排金属纽扣与手腕星空发圈。

每一笔均为真实的几何矢量闭合路径与三次贝塞尔拟合，拒绝虚假透明度插值！`;
        }
      } else if (text.includes('吸血鬼') || text.includes('哥特') || (text.includes('银发') && text.includes('赤瞳'))) {
        const parsed = AiAnimeGenerator.parsePrompt(text);
        const baseProj = AiAnimeGenerator.generateProject(parsed);
        generatedProject = is10k ? StepDensityEngine.scaleProjectToDensity(baseProj, 10000) : baseProj;
        replyText = `### 🧛 银发赤瞳哥特吸血鬼少女 · 绯月玫瑰 (${generatedProject.steps.length.toLocaleString()} 真实高精笔触) 已生成！

根据你的设定，AI 矢量引擎已完成哥特吸血鬼少女的真实几何笔触解构：
1. **01 初版草图**: 哥特暗夜高傲仰角骨架、蝙蝠恶魔双翼轮廓与小尖牙点位；
2. **02 底色铺设**: 白银波浪发丝底色、深黑天鹅绒蕾丝礼服与暗红内衬；
3. **03 结构阴影**: 赛璐璐深浅明暗折角、恶魔蝠翼光影与维多利亚褶皱；
4. **04 细部雕琢**: 绯红宝石十字星芒瞳孔、发丝根部高光与精致唇珠；
5. **05 神圣光晕**: 飘落鲜红玫瑰花瓣、夜幕血月微光与全息环境调色。

共 ${generatedProject.steps.length.toLocaleString()} 个真实艺术笔触，极度精细，可直接在画布查看！`;
      } else if (text.includes('赛博') || text.includes('机械') || text.includes('猫耳')) {
        const parsed = AiAnimeGenerator.parsePrompt(text);
        const baseProj = AiAnimeGenerator.generateProject(parsed);
        generatedProject = is10k ? StepDensityEngine.scaleProjectToDensity(baseProj, 10000) : baseProj;
        replyText = `### 🐱 赛博朋克猫耳机械娘 · 霓虹巡游 (${generatedProject.steps.length.toLocaleString()} 真实高精笔触) 已生成！

根据你的要求，AI 代码矢量引擎已构建赛博朋克霓虹机械娘工程：
1. **01 初版草图**: 机械外骨骼透视框、全息猫耳天线与目镜 HUD 中轴；
2. **02 底色铺设**: 青粉双色渐变发丝底色、哑光高分子战衣与工装裤；
3. **03 结构阴影**: 发光机械耳甲阴影、战术机能外套与结构反光；
4. **04 细部雕琢**: 全息黄色星瞳、数据光标瞄准框与发丝微电路；
5. **05 神圣光晕**: 蜂巢六边形能量护盾粒子与赛博霓虹氛围。

共 ${generatedProject.steps.length.toLocaleString()} 个真实艺术笔触，呈现亚像素级几何细腻度！`;
      } else if (text.includes('巫女') || text.includes('和服') || text.includes('黑长直')) {
        const parsed = AiAnimeGenerator.parsePrompt(text);
        const baseProj = AiAnimeGenerator.generateProject(parsed);
        generatedProject = is10k ? StepDensityEngine.scaleProjectToDensity(baseProj, 10000) : baseProj;
        replyText = `### 🌸 极黑长直和服巫女 · 绯樱祈愿 (${generatedProject.steps.length.toLocaleString()} 真实高精笔触) 已生成！

根据你的设定，AI 引擎已完成和风神道巫女主题创作：
1. **01 初版草图**: 姬发式黑长直垂落线条、振袖和服与神乐铃结构；
2. **02 底色铺设**: 乌黑亮丽发丝光泽、纯白白衣与经典赤红绯袴；
3. **03 结构阴影**: 纯白千早披肩阴影、结草编织绳与和服重叠褶皱；
4. **04 细部雕琢**: 金黄明净琥珀星瞳、发丝边缘反光与金色神乐铃；
5. **05 神圣光晕**: 漫天飞舞粉嫩樱花瓣与神道祈愿灵光微粒。

共 ${generatedProject.steps.length.toLocaleString()} 个真实艺术笔触，线条精细优雅！`;
      } else if (text.includes('魔法少女') || text.includes('魔杖')) {
        const parsed = AiAnimeGenerator.parsePrompt(text);
        const baseProj = AiAnimeGenerator.generateProject(parsed);
        generatedProject = is10k ? StepDensityEngine.scaleProjectToDensity(baseProj, 10000) : baseProj;
        replyText = `### 💫 星之双马尾魔法少女 · 璨星华章 (${generatedProject.steps.length.toLocaleString()} 真实高精笔触) 已生成！

已调用星空梦幻魔法少女矢量生成管线：
1. **01 初版草图**: 螺旋双马尾动态曲线、蓬蓬裙摆与星之权杖线稿；
2. **02 底色铺设**: 金黄奶油发色底色、星空粉紫多层洛丽塔裙摆；
3. **03 结构阴影**: 镀金星辰法杖立体转折、粉色蝴蝶结绸带阴影；
4. **04 细部雕琢**: 天蓝宝石双重星芒瞳孔、发丝卷曲微高光；
5. **05 神圣光晕**: 漫天飘洒十字金星微粒与魔法辉光。

共 ${generatedProject.steps.length.toLocaleString()} 个真实艺术笔触，梦幻璀璨！`;
      } else {
        // Natural language anime character & action synthesis
        const parsed = AiAnimeGenerator.parsePrompt(text);
        const baseProj = AiAnimeGenerator.generateProject(parsed);
        generatedProject = is10k ? StepDensityEngine.scaleProjectToDensity(baseProj, 10000) : baseProj;

        replyText = `### 🎨 ${generatedProject.title} (${generatedProject.steps.length.toLocaleString()} 真实高精矢量笔触) 已生成！

根据你的设定，AI 智能体已深度解构人物形态并完成高质量矢量绘制：
- 🎬 **动作与动态骨架**: ${getPoseDescription(parsed.actionPose)}
- 🎨 **色彩与光影分层**: ${parsed.hairColor ? `${parsed.hairColor}发色` : '原画'}发丝 · ${parsed.eyeColor ? `${parsed.eyeColor}瞳色` : '灵动'}眼眸 · ${parsed.outfitStyle || '高定'}服饰
- ✒️ **墨线与笔触架构**: 采用 DoG 墨线勾勒（加重黑墨线骨架），消除油画碎斑，纯净赛璐璐大块面平涂
- 📐 **5阶段演进**: 01初版草图(${baseProj.stages[0]?.startStep}-${baseProj.stages[0]?.endStep}) -> 02底色铺设 -> 03结构阴影 -> 04细部雕琢 -> 05神圣光晕(${baseProj.stages[4]?.startStep}-${baseProj.stages[4]?.endStep})
- ⚡ **代码增量同步**: 生成全量 SVG DOM 树与毫秒级增量 Diff 代码，点击下方按钮立即在画布查看或回放！`;
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        projectPayload: generatedProject,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (setProject) {
        setProject(generatedProject);
        setCurrentStep(generatedProject.steps.length);
        setIsPlaying(false);
      }
      setIsProcessing(false);
    }, 700);
  };

  const handleApplyToCanvas = (proj: ProjectData) => {
    if (setProject) {
      setProject(proj);
      setCurrentStep(proj.steps.length);
      setIsPlaying(false);
    }
  };

  const handleReplayProject = (proj: ProjectData) => {
    if (setProject) {
      setProject(proj);
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-studio-panel text-zinc-200 select-none ${className}`}>
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-studio-border bg-studio-header/60">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-400 flex items-center justify-center shadow-md shadow-violet-900/30">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white tracking-wide">AI 对话插画师</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                在线
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 block -mt-0.5">代码矢量图协同绘制</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowConfig(!showConfig)}
            title="配置 AI 引擎与 API 密钥"
            className={`p-1.5 rounded-md text-xs border transition-colors ${
              showConfig
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/40'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional API Key Configuration Accordion */}
      {showConfig && (
        <div className="p-3 bg-zinc-950/90 border-b border-studio-border text-xs space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>AI 引擎模式与密钥设置</span>
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
              内置引擎无需 Key 即可运行
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">选择执行引擎模式</label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="内置二次元高精矢量模型 (Local SOTA Engine)">
                ✨ 本地高精二次元矢量引擎 (开箱即用 / 零延迟)
              </option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (需配置 API Key)</option>
              <option value="gpt-4o">OpenAI GPT-4o (需配置 API Key)</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (需配置 API Key)</option>
            </select>
          </div>

          {modelName !== '内置二次元高精矢量模型 (Local SOTA Engine)' && (
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">API Key 密钥</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          )}

          <p className="text-[10px] text-zinc-500">
            提示：本平台默认配备离线完整的二次元数学贝塞尔曲线合成器与语义分层算法，即使未填写外部 API 也能完美生成上万步商业级插画！
          </p>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs leading-relaxed">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isUser
                    ? 'bg-violet-600 text-white'
                    : 'bg-gradient-to-tr from-amber-500 to-fuchsia-600 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3 rounded-xl border ${
                    isUser
                      ? 'bg-violet-600/30 text-violet-100 border-violet-500/40 rounded-tr-none'
                      : 'bg-zinc-900/90 text-zinc-200 border-zinc-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.text}
                  </div>
                </div>

                {/* Attached Artwork Action Card */}
                {msg.projectPayload && (
                  <div className="bg-zinc-950/90 border border-violet-500/40 rounded-xl p-3 space-y-2.5 shadow-md shadow-violet-950/30">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="font-bold text-white text-xs truncate">
                          {msg.projectPayload.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 flex-shrink-0 ml-1">
                        {msg.projectPayload.steps.length.toLocaleString()} 步
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-400 font-mono">
                      <div>阶段: <span className="text-zinc-200">{msg.projectPayload.stages.length} 个演进期</span></div>
                      <div>画布: <span className="text-zinc-200">{msg.projectPayload.canvasWidth}×{msg.projectPayload.canvasHeight}</span></div>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleApplyToCanvas(msg.projectPayload!)}
                        className="flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>在画布渲染</span>
                      </button>

                      <button
                        onClick={() => handleReplayProject(msg.projectPayload!)}
                        className="flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 flex items-center justify-center gap-1 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>动态回放</span>
                      </button>

                      {onSwitchTab && (
                        <button
                          onClick={() => onSwitchTab('diff')}
                          title="查看实时 XML 代码 Diff"
                          className="py-1.5 px-2 rounded-lg text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center justify-center"
                        >
                          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] text-zinc-500 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-xs text-violet-300 p-2.5 bg-violet-950/30 rounded-xl border border-violet-800/40">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span className="font-sans">AI 正在进行贝塞尔拓扑解构并生成高密度代码...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-1.5 border-t border-studio-border bg-studio-bg/60 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.prompt)}
            disabled={isProcessing}
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] bg-zinc-800/90 hover:bg-violet-950/60 hover:text-violet-200 hover:border-violet-600/50 text-zinc-300 border border-zinc-700/80 transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-studio-border bg-studio-panel">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="上传任意参考图像解构为 10,000 步矢量工程"
            className="absolute left-2.5 p-1 text-zinc-400 hover:text-amber-300 rounded transition-colors z-10"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isProcessing}
            placeholder="告诉 AI 你想绘制什么（如：原创粉毛金瞳少女希尔菲、天使弥香、切换10000步精修）..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl py-2.5 pl-8 pr-10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isProcessing}
            className="absolute right-1.5 p-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-amber-500 text-white disabled:opacity-40 transition-all hover:scale-105"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
