import csv, math, numpy
import pandas as pd

start = pd.read_csv('./user/record/start.csv', names=['reqID', 'startTime'])
end = pd.read_csv('./user/record/end.csv', names=['reqID', 'endTime'])
result = start.merge(end, how="left", on="reqID")
result.sort_values(by=['startTime'])
result['startTime'] = result['startTime'] / 1000
result['endTime'] = result['endTime'] / 1000
result['spend'] = result['endTime'] - result['startTime']

count = len(result['spend'])
tsp = (result['startTime'].max() - result['startTime'].min()) / count
mean = result['spend'].mean()
lost = result['spend'].isna().sum()

print(f'''[Statistics]
Total request {count} times, and {tsp:.2f} seconds per request.
Each request takes an average of {mean:.2f} seconds to process.
Lost {lost} request(s) in total''')


