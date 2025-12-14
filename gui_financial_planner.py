#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
个人财务规划软件 GUI 版本
提供图形界面的财务管理功能，包括收入/支出跟踪、预算管理和投资分析
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
from datetime import datetime, date
import math


class FinancialPlannerGUI:
    """财务规划器GUI主类"""

    def __init__(self, root):
        """
        初始化财务规划器GUI
        
        Args:
            root: Tk根窗口
        """
        self.root = root
        self.root.title("个人财务规划软件")
        self.root.geometry("1000x750")
        self.root.minsize(800, 600)
        
        # 数据文件
        self.data_file = "financial_data.json"
        self.data = {
            "income": [],
            "expenses": [],
            "budgets": {},
            "investments": []
        }
        self.load_data()
        
        # 投资类型配置（名称、建议比例、预期年化收益率）
        self.investment_config = {
            "应急资金": {"ratio": 0.1, "expected_return": 2.0},
            "定期存款": {"ratio": 0.15, "expected_return": 3.0},
            "国债": {"ratio": 0.1, "expected_return": 3.5},
            "债券基金": {"ratio": 0.1, "expected_return": 5.0},
            "混合基金": {"ratio": 0.15, "expected_return": 7.0},
            "股票基金": {"ratio": 0.2, "expected_return": 10.0},
            "股票": {"ratio": 0.15, "expected_return": 12.0},
            "其他": {"ratio": 0.05, "expected_return": 4.0}
        }
        
        # 当前选中的收入记录索引
        self.selected_income_index = None
        
        # 创建界面
        self.create_widgets()
        self.refresh_data_display()

    def load_data(self):
        """从文件加载财务数据"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                messagebox.showwarning("警告", "数据文件损坏或不存在，使用默认数据")

    def save_data(self):
        """保存财务数据到文件"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            messagebox.showerror("错误", f"保存数据时出错: {e}")

    def create_widgets(self):
        """创建界面组件"""
        # 创建选项卡控件
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 创建各个选项卡
        self.create_income_tab()
        self.create_expense_tab()
        self.create_budget_tab()
        self.create_investment_tab()
        self.create_report_tab()
        
    def create_income_tab(self):
        """创建收入选项卡"""
        self.income_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.income_frame, text="收入管理")
        
        # 收入输入区域
        input_frame = ttk.LabelFrame(self.income_frame, text="添加/编辑收入", padding=10)
        input_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 金额
        ttk.Label(input_frame, text="金额:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.income_amount_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.income_amount_var, width=20).grid(row=0, column=1, sticky=tk.W, pady=2)
        
        # 来源
        ttk.Label(input_frame, text="来源:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.income_source_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.income_source_var, width=20).grid(row=1, column=1, sticky=tk.W, pady=2)
        
        # 日期
        ttk.Label(input_frame, text="日期 (YYYY-MM-DD):").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.income_date_var = tk.StringVar(value=date.today().strftime("%Y-%m-%d"))
        ttk.Entry(input_frame, textvariable=self.income_date_var, width=20).grid(row=2, column=1, sticky=tk.W, pady=2)
        
        # 按钮框架
        button_frame = ttk.Frame(input_frame)
        button_frame.grid(row=3, column=0, columnspan=2, pady=10)
        
        # 添加/更新按钮
        self.income_add_update_button = ttk.Button(button_frame, text="添加收入", command=self.add_or_update_income)
        self.income_add_update_button.pack(side=tk.LEFT, padx=(0, 5))
        
        # 取消编辑按钮
        self.income_cancel_button = ttk.Button(button_frame, text="取消编辑", command=self.cancel_income_edit, state=tk.DISABLED)
        self.income_cancel_button.pack(side=tk.LEFT, padx=(0, 5))
        
        # 删除按钮
        ttk.Button(button_frame, text="删除选中收入", command=self.delete_selected_income).pack(side=tk.LEFT)
        
        # 收入列表区域
        list_frame = ttk.LabelFrame(self.income_frame, text="收入记录", padding=10)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 创建Treeview来显示收入记录
        columns = ('日期', '来源', '金额')
        self.income_tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=10)
        
        # 定义列标题
        for col in columns:
            self.income_tree.heading(col, text=col)
            self.income_tree.column(col, width=100)
        
        # 添加滚动条
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.income_tree.yview)
        self.income_tree.configure(yscroll=scrollbar.set)
        
        # 绑定选择事件
        self.income_tree.bind('<ButtonRelease-1>', self.on_income_select)
        
        # 布局
        self.income_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
    def create_expense_tab(self):
        """创建支出选项卡"""
        self.expense_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.expense_frame, text="支出管理")
        
        # 支出输入区域
        input_frame = ttk.LabelFrame(self.expense_frame, text="添加支出", padding=10)
        input_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 金额
        ttk.Label(input_frame, text="金额:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.expense_amount_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.expense_amount_var, width=20).grid(row=0, column=1, sticky=tk.W, pady=2)
        
        # 类别
        ttk.Label(input_frame, text="类别:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.expense_category_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.expense_category_var, width=20).grid(row=1, column=1, sticky=tk.W, pady=2)
        
        # 描述
        ttk.Label(input_frame, text="描述:").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.expense_description_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.expense_description_var, width=20).grid(row=2, column=1, sticky=tk.W, pady=2)
        
        # 日期
        ttk.Label(input_frame, text="日期 (YYYY-MM-DD):").grid(row=3, column=0, sticky=tk.W, pady=2)
        self.expense_date_var = tk.StringVar(value=date.today().strftime("%Y-%m-%d"))
        ttk.Entry(input_frame, textvariable=self.expense_date_var, width=20).grid(row=3, column=1, sticky=tk.W, pady=2)
        
        # 添加按钮
        ttk.Button(input_frame, text="添加支出", command=self.add_expense).grid(row=4, column=0, columnspan=2, pady=10)
        
        # 支出列表区域
        list_frame = ttk.LabelFrame(self.expense_frame, text="支出记录", padding=10)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 创建Treeview来显示支出记录
        columns = ('日期', '类别', '描述', '金额')
        self.expense_tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=10)
        
        # 定义列标题
        for col in columns:
            self.expense_tree.heading(col, text=col)
            self.expense_tree.column(col, width=100)
        
        # 添加滚动条
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.expense_tree.yview)
        self.expense_tree.configure(yscroll=scrollbar.set)
        
        # 布局
        self.expense_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
    def create_budget_tab(self):
        """创建预算选项卡"""
        self.budget_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.budget_frame, text="预算管理")
        
        # 预算设置区域
        input_frame = ttk.LabelFrame(self.budget_frame, text="设置预算", padding=10)
        input_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 类别
        ttk.Label(input_frame, text="类别:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.budget_category_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.budget_category_var, width=20).grid(row=0, column=1, sticky=tk.W, pady=2)
        
        # 预算金额
        ttk.Label(input_frame, text="预算金额:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.budget_amount_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.budget_amount_var, width=20).grid(row=1, column=1, sticky=tk.W, pady=2)
        
        # 设置按钮
        ttk.Button(input_frame, text="设置预算", command=self.set_budget).grid(row=2, column=0, columnspan=2, pady=10)
        
        # 预算状态区域
        status_frame = ttk.LabelFrame(self.budget_frame, text="预算状态", padding=10)
        status_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 创建Treeview来显示预算状态
        columns = ('类别', '预算金额', '已用金额', '剩余金额', '使用率')
        self.budget_tree = ttk.Treeview(status_frame, columns=columns, show='headings', height=10)
        
        # 定义列标题
        for col in columns:
            self.budget_tree.heading(col, text=col)
            self.budget_tree.column(col, width=100)
        
        # 添加滚动条
        scrollbar = ttk.Scrollbar(status_frame, orient=tk.VERTICAL, command=self.budget_tree.yview)
        self.budget_tree.configure(yscroll=scrollbar.set)
        
        # 布局
        self.budget_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
    def create_investment_tab(self):
        """创建投资选项卡"""
        self.investment_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.investment_frame, text="投资管理")
        
        # 投资输入区域
        input_frame = ttk.LabelFrame(self.investment_frame, text="添加投资", padding=10)
        input_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 名称
        ttk.Label(input_frame, text="名称:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.investment_name_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.investment_name_var, width=20).grid(row=0, column=1, sticky=tk.W, pady=2)
        
        # 金额
        ttk.Label(input_frame, text="投资金额:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.investment_amount_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.investment_amount_var, width=20).grid(row=1, column=1, sticky=tk.W, pady=2)
        
        # 实际收益
        ttk.Label(input_frame, text="实际收益:").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.investment_actual_return_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.investment_actual_return_var, width=20).grid(row=2, column=1, sticky=tk.W, pady=2)
        
        # 类型
        ttk.Label(input_frame, text="类型:").grid(row=3, column=0, sticky=tk.W, pady=2)
        self.investment_type_var = tk.StringVar()
        investment_types = list(self.investment_config.keys())
        self.investment_type_combo = ttk.Combobox(input_frame, textvariable=self.investment_type_var, 
                                                 values=investment_types, width=17, state="readonly")
        self.investment_type_combo.grid(row=3, column=1, sticky=tk.W, pady=2)
        self.investment_type_combo.set("股票基金")  # 默认值
        
        # 日期
        ttk.Label(input_frame, text="日期 (YYYY-MM-DD):").grid(row=4, column=0, sticky=tk.W, pady=2)
        self.investment_date_var = tk.StringVar(value=date.today().strftime("%Y-%m-%d"))
        ttk.Entry(input_frame, textvariable=self.investment_date_var, width=20).grid(row=4, column=1, sticky=tk.W, pady=2)
        
        # 添加按钮
        ttk.Button(input_frame, text="添加投资", command=self.add_investment).grid(row=5, column=0, columnspan=2, pady=10)
        
        # 投资建议区域
        suggestion_frame = ttk.LabelFrame(self.investment_frame, text="投资建议", padding=10)
        suggestion_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 总资产信息
        assets_frame = ttk.Frame(suggestion_frame)
        assets_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(assets_frame, text="总资产:", font=("Arial", 10, "bold")).pack(side=tk.LEFT)
        self.total_assets_label = ttk.Label(assets_frame, text="0.00 元")
        self.total_assets_label.pack(side=tk.LEFT, padx=(5, 20))
        
        ttk.Label(assets_frame, text="可投资额:", font=("Arial", 10, "bold")).pack(side=tk.LEFT)
        self.available_assets_label = ttk.Label(assets_frame, text="0.00 元")
        self.available_assets_label.pack(side=tk.LEFT, padx=(5, 0))
        
        # 建议按钮
        ttk.Button(assets_frame, text="生成投资建议", command=self.generate_investment_suggestions).pack(side=tk.RIGHT)
        
        # 创建Treeview来显示投资建议
        suggestion_columns = ('投资类型', '建议比例', '建议金额', '预期年化收益率', '预期收益')
        self.suggestion_tree = ttk.Treeview(suggestion_frame, columns=suggestion_columns, show='headings', height=6)
        
        # 定义列标题
        for col in suggestion_columns:
            self.suggestion_tree.heading(col, text=col)
            self.suggestion_tree.column(col, width=100)
        
        # 添加滚动条
        suggestion_scrollbar = ttk.Scrollbar(suggestion_frame, orient=tk.VERTICAL, command=self.suggestion_tree.yview)
        self.suggestion_tree.configure(yscroll=suggestion_scrollbar.set)
        
        # 布局
        self.suggestion_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        suggestion_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 当前投资列表区域
        list_frame = ttk.LabelFrame(self.investment_frame, text="当前投资", padding=10)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 创建Treeview来显示投资记录
        columns = ('日期', '类型', '名称', '金额', '实际收益', '收益率')
        self.investment_tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=6)
        
        # 定义列标题
        for col in columns:
            self.investment_tree.heading(col, text=col)
            self.investment_tree.column(col, width=100)
        
        # 添加滚动条
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.investment_tree.yview)
        self.investment_tree.configure(yscroll=scrollbar.set)
        
        # 布局
        self.investment_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
    def create_report_tab(self):
        """创建报告选项卡"""
        self.report_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.report_frame, text="财务报告")
        
        # 摘要信息区域
        summary_frame = ttk.LabelFrame(self.report_frame, text="财务摘要", padding=10)
        summary_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.summary_text = tk.Text(summary_frame, height=8, state=tk.DISABLED)
        self.summary_text.pack(fill=tk.BOTH, expand=True)
        
        # 支出分类统计区域
        category_frame = ttk.LabelFrame(self.report_frame, text="支出分类统计", padding=10)
        category_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 创建Treeview来显示支出分类统计
        columns = ('类别', '金额', '占比')
        self.category_tree = ttk.Treeview(category_frame, columns=columns, show='headings', height=6)
        
        # 定义列标题
        for col in columns:
            self.category_tree.heading(col, text=col)
            self.category_tree.column(col, width=100)
        
        # 添加滚动条
        category_scrollbar = ttk.Scrollbar(category_frame, orient=tk.VERTICAL, command=self.category_tree.yview)
        self.category_tree.configure(yscroll=category_scrollbar.set)
        
        # 布局
        self.category_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        category_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 投资分析区域
        investment_analysis_frame = ttk.LabelFrame(self.report_frame, text="投资分析", padding=10)
        investment_analysis_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 投资概览
        overview_frame = ttk.Frame(investment_analysis_frame)
        overview_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.investment_overview_label = ttk.Label(overview_frame, text="总投资: 0.00 元 | 整体收益率: 0.00% | 预期收益率: 0.00%")
        self.investment_overview_label.pack()
        
        # 创建Treeview来显示投资详情
        inv_columns = ('投资类型', '投资金额', '占比', '实际收益', '收益率', '预期年化收益率')
        self.investment_analysis_tree = ttk.Treeview(investment_analysis_frame, columns=inv_columns, show='headings', height=6)
        
        # 定义列标题
        for col in inv_columns:
            self.investment_analysis_tree.heading(col, text=col)
            self.investment_analysis_tree.column(col, width=100)
        
        # 添加滚动条
        inv_scrollbar = ttk.Scrollbar(investment_analysis_frame, orient=tk.VERTICAL, command=self.investment_analysis_tree.yview)
        self.investment_analysis_tree.configure(yscroll=inv_scrollbar.set)
        
        # 布局
        self.investment_analysis_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        inv_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 刷新按钮
        ttk.Button(self.report_frame, text="刷新报告", command=self.refresh_report).pack(pady=10)
        
    def add_or_update_income(self):
        """添加或更新收入记录"""
        try:
            amount = float(self.income_amount_var.get())
            source = self.income_source_var.get()
            date_str = self.income_date_var.get()
            
            # 验证日期格式
            datetime.strptime(date_str, "%Y-%m-%d")
            
            if self.selected_income_index is not None:
                # 更新现有记录
                self.data["income"][self.selected_income_index] = {
                    "amount": amount,
                    "source": source,
                    "date": date_str
                }
                messagebox.showinfo("成功", f"已更新收入记录: {amount}元 来自 {source}")
            else:
                # 添加新记录
                income_record = {
                    "amount": amount,
                    "source": source,
                    "date": date_str
                }
                self.data["income"].append(income_record)
                messagebox.showinfo("成功", f"已添加收入记录: {amount}元 来自 {source}")
            
            self.save_data()
            
            # 清空输入框
            self.clear_income_form()
            
            # 更新显示
            self.refresh_data_display()
            
        except ValueError:
            messagebox.showerror("错误", "请输入有效的金额和正确格式的日期 (YYYY-MM-DD)")
            
    def cancel_income_edit(self):
        """取消收入编辑"""
        self.clear_income_form()
        self.selected_income_index = None
        self.income_add_update_button.config(text="添加收入")
        self.income_cancel_button.config(state=tk.DISABLED)
        
    def delete_selected_income(self):
        """删除选中的收入记录"""
        selected_items = self.income_tree.selection()
        if not selected_items:
            messagebox.showwarning("警告", "请先选择要删除的收入记录")
            return
            
        # 确认删除
        if messagebox.askyesno("确认删除", "确定要删除选中的收入记录吗？"):
            # 获取选中项在TreeView中的位置
            item = selected_items[0]
            # 获取该项对应的索引
            index = self.income_tree.index(item)
            
            # 删除数据
            del self.data["income"][index]
            self.save_data()
            
            # 更新显示
            self.refresh_data_display()
            messagebox.showinfo("成功", "已删除选中的收入记录")
            
    def on_income_select(self, event):
        """当用户选择收入记录时触发"""
        selected_items = self.income_tree.selection()
        if not selected_items:
            return
            
        # 获取选中项在TreeView中的位置
        item = selected_items[0]
        # 获取该项对应的索引
        self.selected_income_index = self.income_tree.index(item)
        
        # 填充表单
        income = self.data["income"][self.selected_income_index]
        self.income_amount_var.set(str(income["amount"]))
        self.income_source_var.set(income["source"])
        self.income_date_var.set(income["date"])
        
        # 更改按钮状态
        self.income_add_update_button.config(text="更新收入")
        self.income_cancel_button.config(state=tk.NORMAL)
        
    def clear_income_form(self):
        """清空收入表单"""
        self.income_amount_var.set("")
        self.income_source_var.set("")
        self.income_date_var.set(date.today().strftime("%Y-%m-%d"))
        self.income_add_update_button.config(text="添加收入")
        self.income_cancel_button.config(state=tk.DISABLED)
        
    def add_expense(self):
        """添加支出记录"""
        try:
            amount = float(self.expense_amount_var.get())
            category = self.expense_category_var.get()
            description = self.expense_description_var.get()
            date_str = self.expense_date_var.get()
            
            # 验证日期格式
            datetime.strptime(date_str, "%Y-%m-%d")
            
            expense_record = {
                "amount": amount,
                "category": category,
                "description": description,
                "date": date_str
            }
            
            self.data["expenses"].append(expense_record)
            self.save_data()
            
            # 清空输入框
            self.expense_amount_var.set("")
            self.expense_category_var.set("")
            self.expense_description_var.set("")
            self.expense_date_var.set(date.today().strftime("%Y-%m-%d"))
            
            # 更新显示
            self.refresh_data_display()
            
            messagebox.showinfo("成功", f"已添加支出记录: {amount}元 类别 {category}")
            
        except ValueError:
            messagebox.showerror("错误", "请输入有效的金额和正确格式的日期 (YYYY-MM-DD)")
            
    def set_budget(self):
        """设置预算"""
        try:
            category = self.budget_category_var.get()
            amount = float(self.budget_amount_var.get())
            
            if not category:
                messagebox.showerror("错误", "请输入预算类别")
                return
                
            self.data["budgets"][category] = amount
            self.save_data()
            
            # 清空输入框
            self.budget_category_var.set("")
            self.budget_amount_var.set("")
            
            # 更新显示
            self.refresh_data_display()
            
            messagebox.showinfo("成功", f"已设置 {category} 预算: {amount}元")
            
        except ValueError:
            messagebox.showerror("错误", "请输入有效的预算金额")
            
    def add_investment(self):
        """添加投资记录"""
        try:
            name = self.investment_name_var.get()
            amount = float(self.investment_amount_var.get())
            actual_return = float(self.investment_actual_return_var.get()) if self.investment_actual_return_var.get() else 0.0
            investment_type = self.investment_type_var.get()
            date_str = self.investment_date_var.get()
            
            # 验证日期格式
            datetime.strptime(date_str, "%Y-%m-%d")
            
            investment_record = {
                "name": name,
                "amount": amount,
                "actual_return": actual_return,
                "type": investment_type,
                "date": date_str
            }
            
            self.data["investments"].append(investment_record)
            self.save_data()
            
            # 清空输入框
            self.investment_name_var.set("")
            self.investment_amount_var.set("")
            self.investment_actual_return_var.set("")
            self.investment_type_var.set("股票基金")
            self.investment_date_var.set(date.today().strftime("%Y-%m-%d"))
            
            # 更新显示
            self.refresh_data_display()
            
            messagebox.showinfo("成功", f"已添加投资记录: {amount}元 {investment_type} - {name}")
            
        except ValueError:
            messagebox.showerror("错误", "请输入有效的金额和正确格式的日期 (YYYY-MM-DD)")
            
    def generate_investment_suggestions(self):
        """生成投资建议"""
        # 清空现有建议
        for item in self.suggestion_tree.get_children():
            self.suggestion_tree.delete(item)
            
        # 计算总资产和可用资产
        total_assets = self.calculate_total_assets()
        invested_assets = sum(inv["amount"] for inv in self.data["investments"])
        available_assets = total_assets - invested_assets
        
        # 更新标签
        self.total_assets_label.config(text=f"{total_assets:.2f} 元")
        self.available_assets_label.config(text=f"{available_assets:.2f} 元")
        
        # 生成建议
        for inv_type, config in self.investment_config.items():
            ratio = config["ratio"]
            suggested_amount = available_assets * ratio
            expected_return_rate = config["expected_return"]
            expected_return = suggested_amount * expected_return_rate / 100
            
            self.suggestion_tree.insert('', tk.END, values=(
                inv_type,
                f"{ratio*100:.1f}%",
                f"{suggested_amount:.2f}",
                f"{expected_return_rate:.1f}%",
                f"{expected_return:.2f}"
            ))
            
    def calculate_total_assets(self):
        """计算总资产"""
        total_income = sum(income["amount"] for income in self.data["income"])
        total_expenses = sum(expense["amount"] for expense in self.data["expenses"])
        return total_income - total_expenses
    
    def refresh_data_display(self):
        """刷新所有数据显示"""
        self.refresh_income_list()
        self.refresh_expense_list()
        self.refresh_budget_list()
        self.refresh_investment_list()
        self.refresh_report()
        
    def refresh_income_list(self):
        """刷新收入列表显示"""
        # 清空现有项目
        for item in self.income_tree.get_children():
            self.income_tree.delete(item)
            
        # 添加新项目（按日期倒序排列）
        sorted_income = sorted(self.data["income"], key=lambda x: x["date"], reverse=True)
        for income in sorted_income:
            self.income_tree.insert('', tk.END, values=(
                income["date"],
                income["source"],
                f"{income['amount']:.2f}"
            ))
            
    def refresh_expense_list(self):
        """刷新支出列表显示"""
        # 清空现有项目
        for item in self.expense_tree.get_children():
            self.expense_tree.delete(item)
            
        # 添加新项目（按日期倒序排列）
        sorted_expenses = sorted(self.data["expenses"], key=lambda x: x["date"], reverse=True)
        for expense in sorted_expenses:
            self.expense_tree.insert('', tk.END, values=(
                expense["date"],
                expense["category"],
                expense["description"],
                f"{expense['amount']:.2f}"
            ))
            
    def refresh_budget_list(self):
        """刷新预算列表显示"""
        # 清空现有项目
        for item in self.budget_tree.get_children():
            self.budget_tree.delete(item)
            
        # 按类别统计支出
        category_expenses = {}
        for expense in self.data["expenses"]:
            category = expense["category"]
            if category not in category_expenses:
                category_expenses[category] = 0
            category_expenses[category] += expense["amount"]
            
        # 添加预算项目
        for category, budget_amount in self.data["budgets"].items():
            spent = category_expenses.get(category, 0)
            remaining = budget_amount - spent
            if budget_amount > 0:
                percent_used = (spent / budget_amount) * 100
            else:
                percent_used = 0
            
            self.budget_tree.insert('', tk.END, values=(
                category,
                f"{budget_amount:.2f}",
                f"{spent:.2f}",
                f"{remaining:.2f}",
                f"{percent_used:.1f}%"
            ))
            
    def refresh_investment_list(self):
        """刷新投资列表显示"""
        # 清空现有项目
        for item in self.investment_tree.get_children():
            self.investment_tree.delete(item)
            
        # 添加新项目（按日期倒序排列）
        sorted_investments = sorted(self.data["investments"], key=lambda x: x["date"], reverse=True)
        for investment in sorted_investments:
            amount = investment["amount"]
            actual_return = investment.get("actual_return", 0.0)
            # 计算收益率
            if amount > 0:
                return_rate = (actual_return / amount) * 100
            else:
                return_rate = 0.0
                
            self.investment_tree.insert('', tk.END, values=(
                investment["date"],
                investment["type"],
                investment["name"],
                f"{investment['amount']:.2f}",
                f"{investment.get('actual_return', 0.0):.2f}",
                f"{return_rate:.2f}%"
            ))
            
    def refresh_report(self):
        """刷新报告显示"""
        # 计算总览数据
        total_income = sum(income["amount"] for income in self.data["income"])
        total_expenses = sum(expense["amount"] for expense in self.data["expenses"])
        balance = total_income - total_expenses
        savings_rate = (balance / total_income) * 100 if total_income > 0 and balance > 0 else 0
        
        # 更新摘要文本
        self.summary_text.config(state=tk.NORMAL)
        self.summary_text.delete(1.0, tk.END)
        
        summary_content = f"""财务摘要
{'='*30}
总收入: {total_income:.2f} 元
总支出: {total_expenses:.2f} 元
结余: {balance:.2f} 元
储蓄率: {savings_rate:.2f}%

最近5笔收入:
"""
        # 添加最近收入记录
        recent_income = sorted(self.data["income"], key=lambda x: x["date"], reverse=True)[:5]
        for income in recent_income:
            summary_content += f"  {income['date']} | {income['source']}: {income['amount']:.2f}元\n"
            
        summary_content += "\n最近5笔支出:\n"
        # 添加最近支出记录
        recent_expenses = sorted(self.data["expenses"], key=lambda x: x["date"], reverse=True)[:5]
        for expense in recent_expenses:
            summary_content += f"  {expense['date']} | {expense['category']} - {expense['description']}: {expense['amount']:.2f}元\n"
            
        self.summary_text.insert(tk.END, summary_content)
        self.summary_text.config(state=tk.DISABLED)
        
        # 更新支出分类统计
        # 清空现有项目
        for item in self.category_tree.get_children():
            self.category_tree.delete(item)
            
        # 按类别统计支出
        category_expenses = {}
        for expense in self.data["expenses"]:
            category = expense["category"]
            if category not in category_expenses:
                category_expenses[category] = 0
            category_expenses[category] += expense["amount"]
            
        # 计算总支出用于计算占比
        total_expenses_for_percent = sum(category_expenses.values())
        
        # 按金额排序并显示
        sorted_categories = sorted(category_expenses.items(), key=lambda x: x[1], reverse=True)
        for category, amount in sorted_categories:
            percentage = (amount / total_expenses_for_percent) * 100 if total_expenses_for_percent > 0 else 0
            self.category_tree.insert('', tk.END, values=(
                category,
                f"{amount:.2f}",
                f"{percentage:.1f}%"
            ))
            
        # 更新投资分析
        # 清空现有项目
        for item in self.investment_analysis_tree.get_children():
            self.investment_analysis_tree.delete(item)
            
        # 按类型统计投资
        type_investments = {}
        type_actual_returns = {}
        for investment in self.data["investments"]:
            inv_type = investment["type"]
            if inv_type not in type_investments:
                type_investments[inv_type] = 0
                type_actual_returns[inv_type] = 0
            type_investments[inv_type] += investment["amount"]
            type_actual_returns[inv_type] += investment.get("actual_return", 0.0)
            
        # 计算总投资额和总收益用于计算占比
        total_investment_for_percent = sum(type_investments.values())
        total_actual_return = sum(type_actual_returns.values())
        
        # 计算整体收益率
        overall_return_rate = (total_actual_return / total_investment_for_percent) * 100 if total_investment_for_percent > 0 else 0
        
        # 计算预期收益率
        total_expected_return = 0
        for inv_type, amount in type_investments.items():
            if inv_type in self.investment_config:
                expected_rate = self.investment_config[inv_type]["expected_return"]
                expected_return = amount * expected_rate / 100
                total_expected_return += expected_return
                
        expected_return_rate = (total_expected_return / total_investment_for_percent) * 100 if total_investment_for_percent > 0 else 0
        
        # 更新投资概览标签
        self.investment_overview_label.config(
            text=f"总投资: {total_investment_for_percent:.2f} 元 | "
                 f"整体收益率: {overall_return_rate:.2f}% | "
                 f"预期收益率: {expected_return_rate:.2f}%"
        )
        
        # 按金额排序并显示
        sorted_inv_types = sorted(type_investments.items(), key=lambda x: x[1], reverse=True)
        for inv_type, amount in sorted_inv_types:
            percentage = (amount / total_investment_for_percent) * 100 if total_investment_for_percent > 0 else 0
            actual_return = type_actual_returns[inv_type]
            
            # 计算该类型的收益率
            type_return_rate = (actual_return / amount) * 100 if amount > 0 else 0
            
            # 获取预期年化收益率
            expected_annual_return = self.investment_config.get(inv_type, {}).get("expected_return", 0.0)
            
            self.investment_analysis_tree.insert('', tk.END, values=(
                inv_type,
                f"{amount:.2f}",
                f"{percentage:.1f}%",
                f"{actual_return:.2f}",
                f"{type_return_rate:.2f}%",
                f"{expected_annual_return:.1f}%"
            ))


def main():
    """主程序入口"""
    root = tk.Tk()
    app = FinancialPlannerGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()