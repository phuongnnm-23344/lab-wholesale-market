"""Canvas-style annotated screens for incentive / rule (SC-09-04, SC-10-04).

Numbers on the image = item No in wireframes/SC-xx-yy-*-wireframe.md (1-1 with spec section 4).
"""
from PIL import Image, ImageDraw

from .common import font

class Canvas:
    def __init__(self, w, h, title, crumb):
        self.img = Image.new("RGB", (w, h), "white")
        self.d = ImageDraw.Draw(self.img)
        self.badges = []
        d = self.d
        d.rectangle([0, 0, w, 56], fill="#1f3a5f")
        d.text((16, 14), "水産物卸売市場 業務支援システム", font=font(18, True), fill="white")
        d.text((w - 520, 16), "業務日 2027/09/14(火)   照合部門長 桜 七子   利用者切替   ログアウト", font=font(14), fill="white")
        d.rectangle([0, 56, 170, h], fill="#eef1f5")
        for i, m in enumerate(["取引", "ロット", "引渡し", "精算・締め", "修正申請", "入金・奨励金", "規則・マスタ", "帳票"]):
            d.text((16, 76 + i * 30), m, font=font(14), fill="#333")
        d.text((190, 66), crumb, font=font(13), fill="#666")
        d.text((190, 88), title, font=font(22, True), fill="#111")

    def box(self, xy, fill="#ffffff", outline="#999999", width=1):
        self.d.rectangle(xy, fill=fill, outline=outline, width=width)

    def text(self, xy, s, size=14, bold=False, color="#222"):
        self.d.text(xy, s, font=font(size, bold), fill=color)

    def button(self, xy, s, primary=False, disabled=False):
        fill = "#c62828" if primary else "#ffffff"
        if disabled:
            fill = "#e0e0e0"
        self.box(xy, fill=fill, outline="#555", width=2)
        color = "white" if primary and not disabled else "#222"
        self.text((xy[0] + 12, xy[1] + 9), s, 14, True, color)

    def badge(self, n, xy, region=None):
        """Number badge; region draws a dashed-ish red frame around the item."""
        if region:
            self.d.rectangle(region, outline="#d50000", width=2)
        self.badges.append((str(n), xy))

    def save(self, path):
        for n, (x, y) in self.badges:
            x -= 14  # keep badge left of the label so the first character stays readable
            r = 14 if len(n) == 1 else 16
            self.d.ellipse([x - r, y - r, x + r, y + r], fill="#d50000", outline="white", width=2)
            f = font(15, True)
            tw = self.d.textlength(n, font=f)
            self.d.text((x - tw / 2, y - 11), n, font=f, fill="white")
        path.parent.mkdir(parents=True, exist_ok=True)
        self.img.save(path)


def sc_09_04(out):
    c = Canvas(1366, 1060, "奨励金計算・期ロック", "ホーム › 入金・奨励金 › 奨励金計算・期ロック")
    c.text((200, 130), "対象期 2027-08（2027/08/01〜08/31、業務日基準）  支払期日 2027/09/10(金)", 15, True)
    c.badge(1, (196, 128), (194, 126, 860, 152))
    c.text((900, 130), "適用規則版 第3版", 15, True)
    c.badge(2, (896, 128), (894, 126, 1060, 152))
    c.text((200, 166), "ステップ  ① 入金の割当・要確認 ●    ② 期ロック（正式計算）○", 15)
    c.badge(3, (196, 166), (194, 162, 760, 190))
    # [4] allocation table
    c.box((194, 200, 1340, 524), outline="#555", width=2)
    c.text((206, 206), "① 入金の割当（どの期に充当したか）", 15, True)
    c.badge(4, (200, 208))
    cols = ["買受人", "期のお支払額", "期日内入金", "充当先の内訳", "完納", "注意"]
    xs = [210, 300, 440, 580, 960, 1040]
    for x, s in zip(xs, cols):
        c.text((x, 236), s, 13, True)
    rows = [
        ["N01", "¥1,080,000", "¥1,080,000", "2027-08: ¥1,080,000", "○", ""],
        ["B07", "¥54,000", "¥66,000", "07: ¥12,000(FIFO) / 08: ¥54,000", "○", "⚠ 旧期充当"],
        ["B11", "¥324,000", "¥323,560", "2027-08: ¥323,560", "要確認", "手数料差引の疑い"],
    ]
    for r, row in enumerate(rows):
        y = 266 + r * 34
        for x, s in zip(xs, row):
            c.text((x, y), s, 13)
    c.badge(5, (1036, 300), (1034, 296, 1150, 322))
    c.badge(14, (1036, 334), (1034, 330, 1190, 356))
    c.box((960, 362, 1330, 398), fill="#fff8e1", outline="#f9a825")
    c.text((968, 370), "判断 (○完納 ●非完納)  理由[__________]", 12)
    c.text((210, 410), "請求番号なし → FIFO で充当（E-02 回答後に変更）", 13)
    c.badge(6, (204, 410), (202, 406, 620, 430))
    c.text((210, 440), "前期以前の調整（期ロック済の期に属する訂正）: N04 2027-07期（移行期）−¥41,040 → 差額へ", 13)
    c.badge(15, (204, 440), (202, 436, 1000, 462))
    c.text((210, 470), "前期分の後入力（この期の支払額に含む）: B12 取引日 07/30 ¥200,000", 13)
    c.badge(18, (204, 470), (202, 466, 820, 492))
    c.text((210, 498), "□ 支払期日分までの入金CSV取込済　最新の入金日 2027/09/10（取込 09/13 08:40）", 13, True)
    c.badge(17, (204, 498), (202, 494, 900, 520))
    # [7] preview block
    c.box((194, 542, 1340, 886), outline="#555", width=2)
    c.text((206, 548), "試算結果（記録されません — 最終 14:05 実行）", 15, True)
    c.badge(7, (200, 550))
    c.box((206, 578, 340, 606), fill="#1f3a5f")
    c.text((216, 583), "仲卸 交付率表", 13, True, "white")
    c.box((344, 578, 510, 606))
    c.text((354, 583), "売買参加者 交付率表", 13)
    c.badge(8, (204, 578), (204, 576, 512, 608))
    cols2 = ["買受人", "種別", "適格金額(税抜)", "段階", "交付率", "奨励金", "区分", "参照期", "版"]
    xs2 = [210, 290, 360, 520, 580, 650, 760, 840, 940]
    for x, s in zip(xs2, cols2):
        c.text((x, 618), s, 13, True)
    for r, row in enumerate([
        ["N01", "仲卸", "¥1,000,000", "3", "0.9%", "¥9,900", "本計算", "—", "第3版"],
        ["N04", "仲卸", "—", "—", "—", "−¥1,320", "差額", "2027-07", "稼働時の版（移行期）"],
    ]):
        for x, s in zip(xs2, row):
            c.text((x, 648 + r * 30), s, 13)
    c.text((210, 720), "端数調整行: +¥2（税率別合計との差）", 13)
    c.badge(9, (204, 720), (202, 716, 560, 740))
    c.text((210, 756), "負の差額の繰越: N04 −¥1,320 → 2027-09期以降の奨励金から差引（年度末 2028-03期まで）", 13)
    c.badge(10, (204, 756), (202, 752, 1000, 776))
    c.text((210, 792), "前回の試算（13:40）との差: 合計 −¥1,320（N04 差額が増加）", 13)
    c.badge(16, (204, 792), (202, 788, 760, 812))
    c.button((200, 916, 520, 956), "試算（記録しない・何度でも可）")
    c.badge(11, (200, 916))
    c.button((560, 916, 860, 956), "期ロック（正式計算・確定）", primary=True)
    c.badge(13, (560, 916))
    c.text((200, 996), "No 12（計算して記録）は 0.2.0 で廃止 — 欠番（番号は再利用しない）", 12, color="#666")
    c.save(out)


def sc_10_04(out):
    c = Canvas(1366, 960, "規則版確認・ロールバック", "ホーム › 規則・マスタ › 規則版一覧 › 規則版確認・ロールバック")
    c.text((200, 132), "状態 確認待ち", 15, True)
    c.badge(1, (196, 132), (194, 128, 330, 156))
    c.text((360, 132), "種別 通常改定 / ロールバック（第2版の内容に戻す）", 15)
    c.badge(2, (356, 132), (354, 128, 800, 156))
    c.text((200, 168), "発効日 2027/10/01（毎月1日のみ）", 15)
    c.badge(3, (196, 168), (194, 164, 500, 192))
    c.text((540, 168), "起票者 桜 九子（ルール管理者）", 15)
    c.badge(4, (536, 168), (534, 164, 820, 192))
    c.box((860, 160, 1330, 196), fill="#fff8e1", outline="#f9a825")
    c.text((870, 168), "今年度（2027年度）の発効回数 2 / 4 回", 14, True)
    c.badge(5, (856, 162))
    c.box((194, 212, 1340, 470), outline="#555", width=2)
    c.text((206, 218), "変更点（この版 vs 現在適用中 第3版）", 15, True)
    c.badge(6, (200, 220))
    xs = [210, 450, 760, 900, 1020, 1120]
    for x, s in zip(xs, ["区分", "項目", "現在", "この版", "差", ""]):
        c.text((x, 248), s, 13, True)
    rows = [
        ["交付率（仲卸）", "段階3 ¥1,000,000〜", "0.9%", "1.0%", "▲"],
        ["交付率（売買参加者）", "変更なし", "", "", ""],
        ["修正申請 2段階決裁の閾値", "買受人別の変動額（税込）", "¥100,000", "¥150,000", "▲"],
        ["支払期日", "翌月10日（銀行休業日は前銀行営業日）", "変更なし", "", ""],
        ["締め時刻 / 受付開始 / 取引開始 / 引渡し", "変更なし", "", "", ""],
    ]
    for r, row in enumerate(rows):
        for x, s in zip(xs, row):
            c.text((x, 278 + r * 30), s, 13)
    c.text((210, 436), "計算例: 適格金額 ¥1,000,000 → 現在 ¥9,900 / この版 ¥11,000（×交付率×110/100）", 13)
    c.badge(15, (204, 436), (202, 432, 900, 458))
    c.text((200, 488), "影響: 2027-10期以降に適用。期ロック済の期は変更しません（訂正は次の期ロックで差額計上）", 14)
    c.badge(7, (196, 488), (194, 484, 1060, 510))
    c.text((200, 524), "備考（起票理由）「…」", 14)
    c.badge(8, (196, 524), (194, 520, 520, 546))
    c.text((200, 560), "差戻し・取消・ロールバックの理由", 14)
    c.box((200, 586, 1000, 650))
    c.badge(9, (196, 588))
    c.button((200, 670, 470, 710), "確認して発効待ちにする", primary=True)
    c.badge(10, (200, 670))
    c.button((500, 670, 640, 710), "差し戻す")
    c.badge(11, (500, 670))
    c.button((670, 670, 900, 710), "取り消す（発効前のみ）")
    c.badge(12, (670, 670))
    c.box((194, 736, 1340, 772), fill="#ffebee", outline="#c62828")
    c.text((206, 744), "今年度の発効回数が上限（4回）に達しています。この版は確認できません", 14, True, "#b71c1c")
    c.badge(13, (196, 738))
    c.box((194, 788, 1340, 910), fill="#f3e5f5", outline="#6a1b9a")
    c.text((206, 794), "4回到達後のロールバック（E-14 未回答 — 2つの分岐を設計、設定スイッチにはしない）", 14, True)
    c.text((216, 824), "N1 案: 確認不可（誤った率の期は修正申請「奨励金」で個別に訂正）", 13)
    c.text((216, 850), "N2 案: 確認可。理由必須、照合部門長の確認 + 運用部門長の決裁（MFA）、経営層へ通知、RPT-12 に回数表示", 13)
    c.button((1110, 862, 1320, 900), "決裁する（運用部門長）")
    c.badge(14, (196, 790))
    c.save(out)
