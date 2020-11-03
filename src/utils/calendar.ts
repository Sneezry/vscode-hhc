import {Content} from './content';

const solarLunar = require("solarLunar");
const numAsc = [["  ___   ", "   __   ", "  ___   ", " ____   ", " _  _   ", " _____  ", "   __   ", " ______ ", "  ___   ", "  ___   "],
[" / _ \\  ", "  /_ |  ", " |__ \\  ", "|___ \\  ", "| || |  ", "| ____| ", "  / /   ", "|____  |", " / _ \\  ", " / _ \\  "],
["| | | | ", "   | |  ", "    ) | ", "  __) | ", "| || |_ ", "| |__   ", " / /_   ", "    / / ", "| (_) | ", "| (_) | "],
["| | | | ", "   | |  ", "   / /  ", " |__ <  ", "|__   _|", "|___ \\  ", "| '_ \\  ", "   / /  ", " > _ <  ", " \\__, | "],
["| |_| | ", "   | |  ", "  / /_  ", " ___) | ", "   | |  ", " ___) | ", "| (_) | ", "  / /   ", "| (_) | ", "   / /  "],
[" \\___/  ", "   |_|  ", " |____| ", "|____/  ", "   |_|  ", "|____/  ", " \\___/  ", " /_/    ", " \\___/  ", "  /_/   "]];

export class Calendar {
  private static getNum(num: number, line: number) {
    let tens = Math.floor(num / 10);
    let ones = num % 10;
    return numAsc[line][tens]+numAsc[line][ones];
  }

  private static getLua(y: number, m: number, d: number) {
    const solar2lunarData = solarLunar.solar2lunar(y, m, d);
    return solar2lunarData.monthCn + solar2lunarData.dayCn;
  }

  private static getLine1() {
    return "⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺";
  }

  private static getLine2(m: number, d: number) {
    let pad = 6;
    if (m >= 10) {
        pad--;
    }
    if (d >= 10) {
        pad--;
    }

    return `${m} 月 ${d} 日　　　　　　　　` + Array(pad).join(" ");
  }

  private static getLine3(y: number, m: number, d: number) {
    let dateLua = Calendar.getLua(y, m, d);
    return `${dateLua}　　　　　　          `;
  }

  private static getLine4() {
    return "⸺⸺⸺⸺⸺          ";
  }

  private static getLine5() {
    return "　　　　　　　　　　          ";
  }

  private static getLine6(y: number, m: number, d: number) {
    let week = "日一二三四五六".split("");
    let day = new Date(`${y}-${m}-${d}`).getDay();
    return `星 期 ${week[day]}　　　　　　　        `;
  }

  private static getLine7() {
    return "　　　　　　　　　　          ";
  }

  private static getLines(y: number, m: number, d: number) {
    let lines = [];
    lines.push(Calendar.getLine1());
    lines.push(Calendar.getLine2(m, d) + Calendar.getNum(d, 0));
    lines.push(Calendar.getLine3(y, m, d) + Calendar.getNum(d, 1));
    lines.push(Calendar.getLine4() + Calendar.getNum(d, 2));
    lines.push(Calendar.getLine5() + Calendar.getNum(d, 3));
    lines.push(Calendar.getLine6(y, m, d) + Calendar.getNum(d, 4));
    lines.push(Calendar.getLine7() + Calendar.getNum(d, 5));
    return lines;
  }

  private static getHead(y: number, m: number, d: number) {
    let lines = Calendar.getLines(y, m, d);
    return lines.join("\n");
  }

  private static getContent(m: number, d: number) {
    let content = Content.raw;
    content = content.split("\n" + m + "-" + d + "\n")[1];
    content = content.split(/\n\d+\-\d+\n/)[0];
    return content;
  }

  public static page(y: number, m: number, d: number) {
    let head = Calendar.getHead(y, m, d);
    let content = Calendar.getContent(m, d);
    let page = head + "\n\n" + content;
    return page;
  }

  public static today() {
    let y = new Date().getFullYear();
    let m = new Date().getMonth() + 1;
    let d = new Date().getDate();
    return Calendar.page(y, m, d);
  }
}