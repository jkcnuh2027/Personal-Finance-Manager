from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np

from ..models import Transaction
from ..schemas import MetricsResponse, MonthlyStat

class AnalyticsService:
    async def get_key_metrics(
        self,
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        categories: Optional[List[str]] = None
    ) -> MetricsResponse:
        """Calculate key financial metrics"""
        query = db.query(Transaction)
        
        # Apply filters
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end_date_obj)
        
        if categories:
            query = query.filter(Transaction.category.in_(categories))
        
        transactions = query.all()
        
        if not transactions:
            return MetricsResponse(
                total_income=0.0,
                total_expenses=0.0,
                net_balance=0.0,
                daily_average=0.0
            )
        
        # Calculate metrics
        income = sum(t.amount for t in transactions if t.category == 'Income')
        expenses = sum(t.amount for t in transactions if t.category != 'Income')
        net_balance = income - expenses
        
        # Calculate daily average
        if start_date and end_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()
            days = (end_dt - start_dt).days + 1
            daily_average = expenses / days if days > 0 else 0
        else:
            dates = [t.date for t in transactions]
            if dates:
                min_date = min(dates)
                max_date = max(dates)
                days = (max_date - min_date).days + 1
                daily_average = expenses / days if days > 0 else 0
            else:
                daily_average = 0
        
        return MetricsResponse(
            total_income=income,
            total_expenses=expenses,
            net_balance=net_balance,
            daily_average=daily_average
        )

    async def get_monthly_stats(
        self,
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        categories: Optional[List[str]] = None
    ) -> List[MonthlyStat]:
        """Get monthly statistics"""
        query = db.query(Transaction)
        
        # Apply filters
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end_date_obj)
        
        if categories:
            query = query.filter(Transaction.category.in_(categories))
        
        transactions = query.all()
        
        if not transactions:
            return []
        
        # Group by month
        monthly_data = {}
        for transaction in transactions:
            month_key = transaction.date.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {'income': 0, 'expenses': 0}
            
            if transaction.category == 'Income':
                monthly_data[month_key]['income'] += transaction.amount
            else:
                monthly_data[month_key]['expenses'] += transaction.amount
        
        # Convert to list of MonthlyStat objects
        monthly_stats = []
        for month, data in sorted(monthly_data.items()):
            monthly_stats.append(MonthlyStat(
                month=month,
                income=data['income'],
                expenses=data['expenses'],
                net=data['income'] - data['expenses']
            ))
        
        return monthly_stats

    async def get_daily_averages(
        self,
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        categories: Optional[List[str]] = None
    ) -> Dict[str, float]:
        """Calculate daily averages by category"""
        query = db.query(Transaction)
        
        # Apply filters
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end_date_obj)
        
        if categories:
            query = query.filter(Transaction.category.in_(categories))
        
        transactions = query.all()
        
        if not transactions:
            return {}
        
        # Calculate date range
        dates = [t.date for t in transactions]
        min_date = min(dates)
        max_date = max(dates)
        days = (max_date - min_date).days + 1
        
        if days == 0:
            return {}
        
        # Group by category and calculate totals
        category_totals = {}
        for transaction in transactions:
            if transaction.category not in category_totals:
                category_totals[transaction.category] = 0
            category_totals[transaction.category] += transaction.amount
        
        # Calculate daily averages
        daily_averages = {}
        for category, total in category_totals.items():
            daily_averages[category] = total / days
        
        return daily_averages

    async def get_percentage_changes(
        self,
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        categories: Optional[List[str]] = None
    ) -> Dict[str, float]:
        """Calculate month-over-month percentage changes"""
        query = db.query(Transaction)
        
        # Apply filters
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end_date_obj)
        
        if categories:
            query = query.filter(Transaction.category.in_(categories))
        
        transactions = query.all()
        
        if not transactions:
            return {}
        
        # Group by month and category
        monthly_category_data = {}
        for transaction in transactions:
            month_key = transaction.date.strftime('%Y-%m')
            if month_key not in monthly_category_data:
                monthly_category_data[month_key] = {}
            if transaction.category not in monthly_category_data[month_key]:
                monthly_category_data[month_key][transaction.category] = 0
            monthly_category_data[month_key][transaction.category] += transaction.amount
        
        months = sorted(monthly_category_data.keys())
        if len(months) < 2:
            return {}
        
        # Calculate percentage changes
        changes = {}
        current_month = months[-1]
        previous_month = months[-2]
        
        for category in monthly_category_data[current_month].keys():
            current_amount = monthly_category_data[current_month].get(category, 0)
            previous_amount = monthly_category_data[previous_month].get(category, 0)
            
            if previous_amount != 0:
                change = ((current_amount - previous_amount) / previous_amount) * 100
                changes[category] = change
            else:
                changes[category] = 100 if current_amount > 0 else 0
        
        return changes

    async def get_trend_analysis(
        self,
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        categories: Optional[List[str]] = None
    ) -> Dict[str, Dict[str, Any]]:
        """Get comprehensive trend analysis"""
        query = db.query(Transaction)
        
        # Apply filters
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end_date_obj)
        
        if categories:
            query = query.filter(Transaction.category.in_(categories))
        
        transactions = query.all()
        
        if not transactions:
            return {}
        
        # Group by month and category
        monthly_category_data = {}
        for transaction in transactions:
            month_key = transaction.date.strftime('%Y-%m')
            if month_key not in monthly_category_data:
                monthly_category_data[month_key] = {}
            if transaction.category not in monthly_category_data[month_key]:
                monthly_category_data[month_key][transaction.category] = 0
            monthly_category_data[month_key][transaction.category] += transaction.amount
        
        months = sorted(monthly_category_data.keys())
        if len(months) < 3:
            return {}
        
        # Calculate trends for each category
        trends = {}
        for category in set().union(*[data.keys() for data in monthly_category_data.values()]):
            category_amounts = [monthly_category_data[month].get(category, 0) for month in months]
            
            if len(category_amounts) >= 3:
                recent_avg = np.mean(category_amounts[-2:])
                older_avg = np.mean(category_amounts[:2])
                
                if older_avg != 0:
                    trend_percentage = ((recent_avg - older_avg) / older_avg) * 100
                    direction = 'increasing' if trend_percentage > 5 else 'decreasing' if trend_percentage < -5 else 'stable'
                else:
                    trend_percentage = 0
                    direction = 'stable'
                
                trends[category] = {
                    'direction': direction,
                    'percentage': trend_percentage
                }
        
        return trends

    async def get_chart_data(
        self,
        db: Session,
        chart_type: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        categories: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Get chart data for different chart types"""
        query = db.query(Transaction)
        
        # Apply filters
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end_date_obj)
        
        if categories:
            query = query.filter(Transaction.category.in_(categories))
        
        transactions = query.all()
        
        if not transactions:
            return {"labels": [], "datasets": []}
        
        # Convert to DataFrame for easier processing
        df = pd.DataFrame([{
            'date': t.date,
            'category': t.category,
            'amount': t.amount
        } for t in transactions])
        
        if chart_type == 'pie':
            return self._get_pie_chart_data(df)
        elif chart_type == 'bar':
            return self._get_bar_chart_data(df)
        elif chart_type == 'line':
            return self._get_line_chart_data(df)
        elif chart_type == 'area':
            return self._get_area_chart_data(df)
        elif chart_type == 'trend':
            return self._get_trend_chart_data(df)
        elif chart_type == 'comparison':
            return self._get_comparison_chart_data(df)
        else:
            return self._get_area_chart_data(df)

    def _get_pie_chart_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate pie chart data"""
        category_totals = df.groupby('category')['amount'].sum()
        
        return {
            "labels": category_totals.index.tolist(),
            "datasets": [{
                "data": category_totals.values.tolist(),
                "backgroundColor": [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
                    '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
                ]
            }]
        }

    def _get_bar_chart_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate bar chart data"""
        dates = sorted(df['date'].unique())
        categories = df['category'].unique()
        
        datasets = []
        colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
        
        for i, category in enumerate(categories):
            category_data = df[df['category'] == category]
            daily_totals = category_data.groupby('date')['amount'].sum()
            
            data = [daily_totals.get(date, 0) for date in dates]
            
            datasets.append({
                "label": category,
                "data": data,
                "backgroundColor": colors[i % len(colors)]
            })
        
        return {
            "labels": [date.strftime('%Y-%m-%d') for date in dates],
            "datasets": datasets
        }

    def _get_line_chart_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate line chart data"""
        return self._get_area_chart_data(df)

    def _get_area_chart_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate area chart data"""
        dates = sorted(df['date'].unique())
        categories = df['category'].unique()
        
        datasets = []
        colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
        
        for i, category in enumerate(categories):
            category_data = df[df['category'] == category]
            daily_totals = category_data.groupby('date')['amount'].sum()
            
            data = [daily_totals.get(date, 0) for date in dates]
            
            datasets.append({
                "label": category,
                "data": data,
                "borderColor": colors[i % len(colors)],
                "backgroundColor": colors[i % len(colors)] + '40',
                "fill": True,
                "tension": 0.4
            })
        
        return {
            "labels": [date.strftime('%Y-%m-%d') for date in dates],
            "datasets": datasets
        }

    def _get_trend_chart_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate trend chart data with moving averages"""
        dates = sorted(df['date'].unique())
        categories = df['category'].unique()
        
        datasets = []
        colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
        
        for i, category in enumerate(categories):
            category_data = df[df['category'] == category]
            daily_totals = category_data.groupby('date')['amount'].sum()
            
            data = [daily_totals.get(date, 0) for date in dates]
            
            # Calculate 7-day moving average
            moving_avg = []
            for j in range(len(data)):
                start_idx = max(0, j - 6)
                window = data[start_idx:j+1]
                moving_avg.append(np.mean(window))
            
            datasets.append({
                "label": f"{category} (Actual)",
                "data": data,
                "borderColor": colors[i % len(colors)],
                "backgroundColor": colors[i % len(colors)] + '40',
                "type": "line"
            })
            
            datasets.append({
                "label": f"{category} (Trend)",
                "data": moving_avg,
                "borderColor": colors[i % len(colors)],
                "backgroundColor": colors[i % len(colors)] + '20',
                "type": "line",
                "borderDash": [5, 5]
            })
        
        return {
            "labels": [date.strftime('%Y-%m-%d') for date in dates],
            "datasets": datasets
        }

    def _get_comparison_chart_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate month-over-month comparison chart data"""
        df['month'] = df['date'].dt.to_period('M')
        monthly_data = df.groupby(['month', 'category'])['amount'].sum().unstack(fill_value=0)
        
        datasets = []
        colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
        
        for i, category in enumerate(monthly_data.columns):
            datasets.append({
                "label": category,
                "data": monthly_data[category].values.tolist(),
                "backgroundColor": colors[i % len(colors)]
            })
        
        return {
            "labels": [str(month) for month in monthly_data.index],
            "datasets": datasets
        }
